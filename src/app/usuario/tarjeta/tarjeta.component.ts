import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';

interface Producto {
  id: number;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  tieneIva: number;
}
interface CartItem { product: Producto; quantity: number; }

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

  tarjetaForm!: FormGroup;
  cartItems: CartItem[] = [];
  isLoading = false;

  private readonly BASE_API  = 'http://localhost:8181';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.tarjetaForm = this.fb.group({
      identificacion: ['', [Validators.required]],
      numeroTarjeta: [
        { value: '', disabled: false },
        [
          Validators.required,
          Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/),
          this.noAllSameDigits()
        ]
      ],
      franquicia:     ['', [Validators.required]],
      expiracion:     ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv:            ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
    this.loadCartItems();
  }

  private setLoadingState(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.tarjetaForm.disable();
    } else {
      this.tarjetaForm.enable();
    }
  }

  get f() { return this.tarjetaForm.controls; }

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
      try { this.cartItems = JSON.parse(raw) as CartItem[]; }
      catch { this.cartItems = []; }
    }
  }

  private noAllSameDigits(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val: string = control.value;
      if (!val) return null;
      const digits = val.replace(/-/g, '');
      if (digits.length !== 16) return null;
      const first = digits[0];
      const allSame = digits.split('').every(d => d === first);
      return allSame ? { allSame: true } : null;
    };
  }

  /** 
   * Busca la transacción por venta. 
   * Si no existe, retorna null.
   */
  private async getTransaccionByVenta(ventaId: number): Promise<any | null> {
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      return await this.http.get(`${this.BASE_API}/transaccion/findByCompra/${ventaId}`, { headers }).toPromise();
    } catch (e) {
      // Si es 404 o error, retorna null
      return null;
    }
  }

  /** Lógica para ACTUALIZAR la transacción existente, nunca crear otra nueva */
  async payViaTarjeta() {
    if (this.tarjetaForm.invalid) {
      this.tarjetaForm.markAllAsTouched();
      return;
    }
    const ventaId = localStorage.getItem('ventaId');
    if (!ventaId) {
      this.notify.error('No se encontró la venta a pagar. Intenta de nuevo.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.notify.error('No estás autenticado. Por favor inicia sesión.');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    this.setLoadingState(true);

    // 1. Buscar transacción existente para esa venta
    const transaccion: any = await this.getTransaccionByVenta(Number(ventaId));
    if (!transaccion || !transaccion.id) {
      this.notify.error('No se encontró la transacción asociada a la venta.');
      this.setLoadingState(false);
      return;
    }

    // 2. Preparar el payload para ACTUALIZAR SOLO los campos necesarios
    const payload = {
      id: transaccion.id,                          // clave para actualizar
      idCompra: transaccion.idCompra,
      idMetodoPago: 6,                             // Tarjeta
      idBanco: 'NA',
      idFranquicia: this.tarjetaForm.value.franquicia,
      numTarjeta: this.tarjetaForm.value.numeroTarjeta.replace(/-/g, ''),
      identificacion: this.tarjetaForm.value.identificacion,
      estado: 1,
      valorTx: transaccion.valorTx,                // Conserva el valor original
      fechaHora: new Date().toISOString()          // Actualiza la fecha/hora de pago
    };

    // 3. Actualizar transacción (no crear nueva)
    this.http.post(`${this.BASE_API}/transaccion/saveTransaccion`, payload, { headers })
      .subscribe({
        next: () => {
          localStorage.removeItem(this.getCartKey());
          localStorage.removeItem('ventaId');
          this.setLoadingState(false);
          this.notify.success('Pago exitoso', 'Tu pago con tarjeta se procesó correctamente. Recibo enviado a tu correo.');
          setTimeout(() => this.router.navigate(['/usuario/vinilos']), 1500);
        },
        error: (err) => {
          this.notify.error('Error al procesar el pago: ' + (err.error || err.message || ''));
          this.setLoadingState(false);
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/usuario/carrito']);
  }
}
