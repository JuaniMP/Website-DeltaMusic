// src/app/usuario/tarjeta/tarjeta.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../shared/notification.service';

interface Producto {
  id: number;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  tieneIva: number;
}

interface CartItem {
  product: Producto;
  quantity: number;
}

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './tarjeta.component.html',
  styleUrls: ['./tarjeta.component.css']
})
export class TarjetaComponent implements OnInit {

  identificacionCliente: string = '';
  tarjetaForm!: FormGroup;
  cartItems: CartItem[] = [];
  isLoading = false;

  private readonly BASE_API        = 'http://localhost:8181';
  private readonly VENTA_API       = `${this.BASE_API}/venta/saveVenta`;
  private readonly TRANSACCION_API = `${this.BASE_API}/transaccion/saveTransaccion`;
  private readonly PRODUCTO_API    = `${this.BASE_API}/producto/saveProducto`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const rawShipping = localStorage.getItem('shipping');
    if (rawShipping) {
      try {
        const ship = JSON.parse(rawShipping) as { idCliente: number; identificacion: string };
        this.identificacionCliente = ship.identificacion || '';
      } catch {
        this.identificacionCliente = '';
      }
    }

    // El campo 'identificacion' ahora editable y recomendado
    this.tarjetaForm = this.fb.group({
      identificacion: [
        { value: this.identificacionCliente, disabled: false }, // editable
        [Validators.required]
      ],
      numeroTarjeta: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/),
          this.noAllSameDigits()
        ]
      ],
      franquicia:     ['', [ Validators.required ]],
      expiracion:     ['', [ Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/) ]],
      cvv:            ['', [ Validators.required, Validators.pattern(/^\d{3}$/) ]]
    });

    this.loadCartItems();
  }

  get f() {
    return this.tarjetaForm.controls;
  }

  private getCartKey(): string {
    const rawUser = localStorage.getItem('auth_user');
    if (!rawUser) return 'cart_anonymous';
    try {
      const user = JSON.parse(rawUser) as { id: number };
      return `cart_${user.id}`;
    } catch {
      return 'cart_anonymous';
    }
  }

  private loadCartItems(): void {
    const key = this.getCartKey();
    const raw = localStorage.getItem(key);
    this.cartItems = [];
    if (raw) {
      try {
        this.cartItems = JSON.parse(raw) as CartItem[];
      } catch {
        this.cartItems = [];
      }
    }
  }

  private noAllSameDigits(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val: string = control.value;
      if (!val) return null;
      const digits = val.replace(/-/g, '');
      if (digits.length !== 16) {
        return null;
      }
      const first = digits[0];
      const allSame = digits.split('').every(d => d === first);
      return allSame ? { allSame: true } : null;
    };
  }

  payViaTarjeta(): void {
    if (this.tarjetaForm.invalid) {
      this.tarjetaForm.markAllAsTouched();
      return;
    }

    const idVenta = +(localStorage.getItem('ventaId') || 0);
    if (!idVenta) {
      this.notify.error('No se encontró la venta para procesar.');
      return;
    }

    if (this.cartItems.length === 0) {
      this.notify.error('Tu carrito está vacío.');
      return;
    }

    // --- TOKEN ---
    const token = localStorage.getItem('token') || '';
    if (!token) {
      this.notify.error('No hay token de autenticación. Vuelve a iniciar sesión.');
      this.isLoading = false;
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.isLoading = true;

    // 1. Traer la venta para actualizar
    this.http.get<any>(`${this.BASE_API}/venta/findRecord/${idVenta}`, { headers }).pipe(
      switchMap((venta) => {
        if (!venta) throw new Error('No existe la venta');
        venta.valorVenta = this.cartItems.reduce((sum, item) => sum + (item.product.precioVentaActual * item.quantity), 0);
        venta.valorIva = this.cartItems.filter(item => item.product.tieneIva === 1)
                                .reduce((sum, item) => sum + Math.round(item.product.precioVentaActual * item.quantity * 0.19), 0);
        venta.estado = 2; // Pagada

        // Debes enviar el request como lo espera tu backend:
        const ventaRequest = {
          venta: {
            ...venta,
            detalles: this.cartItems.map(item => ({
              idProducto: item.product.id,
              cantComp: item.quantity
            }))
          },
          transaccion: {
            idMetodoPago: 6,
            idBanco: 'NA',
            idFranquicia: this.tarjetaForm.value.franquicia,
            numTarjeta: this.tarjetaForm.value.numeroTarjeta.replace(/-/g, ''),
            identificacion: this.tarjetaForm.value.identificacion,
            estado: 1
          }
        };

        return this.http.post<any>(`${this.BASE_API}/venta/saveVenta`, ventaRequest, { headers });
      }),
      // 3. Actualizar stock productos (opcional, puedes omitir si ya lo hace el backend)
      switchMap((ventaResp) => {
        const llamadas = this.cartItems.map(item => {
          return this.http
            .get<Producto>(`${this.BASE_API}/producto/getById/${item.product.id}`, { headers }) // <--- AQUÍ
            .pipe(
              switchMap(prod => {
                prod.existencia -= item.quantity;
                return this.http.post(`${this.PRODUCTO_API}`, prod, { headers }); // <--- Y AQUÍ
              }),
              catchError(err => {
                console.error('Error actualizando stock:', err);
                return of(null);
              })
            );
        });
        return forkJoin(llamadas);
      })
    ).subscribe({
      next: () => {
        this.finalizarPago();
      },
      error: (err) => {
        this.notify.error('Error al procesar el pago: ' + (err.error || err.message || ''));
        this.isLoading = false;
      }
    });
  }

  private finalizarPago(): void {
    // Limpia carrito
    const key = this.getCartKey();
    localStorage.removeItem(key);

    this.isLoading = false;
    this.notify.success(
      'Pago exitoso',
      'Tu pago con tarjeta se procesó correctamente. Recibo enviado a tu correo.'
    );
    setTimeout(() => {
      this.router.navigate(['/usuario/vinilos']);
    }, 1500);
  }

  cancelar(): void {
    this.router.navigate(['/usuario/carrito']);
  }
}
