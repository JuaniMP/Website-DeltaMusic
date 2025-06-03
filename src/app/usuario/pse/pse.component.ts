import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
  selector: 'app-pse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './pse.component.html',
  styleUrls: ['./pse.component.css']
})
export class PseComponent implements OnInit {

  transactionId: string = '';
  userEmail: string = '';
  tipoCliente: '' | 'Persona Natural' | 'Persona Jurídica' = '';
  identificacionCliente: string = '';
  listaTiposCliente: Array<'Persona Natural' | 'Persona Jurídica'> = [
    'Persona Natural', 'Persona Jurídica'
  ];
  bancoSeleccionado: string = '';
  bancosDisponibles: string[] = [
    'Banco de Colombia',
    'Bancolombia',
    'Banco Davivienda',
    'Banco BBVA',
    'Banco Itaú'
  ];
  isLoading: boolean = false;

  cartItems: CartItem[] = [];

  private readonly BASE_API = 'http://localhost:8181';

  constructor(
    private router: Router,
    private http: HttpClient,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.transactionId = 'TX-' + Math.floor(Math.random() * 1_000_000_000);
    // Usuario desde localStorage
    const rawUser = localStorage.getItem('auth_user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as { email: string; tipoCliente?: string };
        this.userEmail = user.email || '';
        this.tipoCliente = user.tipoCliente === 'Persona Jurídica' ? 'Persona Jurídica'
                            : user.tipoCliente === 'Persona Natural' ? 'Persona Natural' : '';
      } catch {
        this.userEmail = '';
        this.tipoCliente = '';
      }
    }
    this.loadCartItems();
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
      try { this.cartItems = JSON.parse(raw) as CartItem[]; }
      catch { this.cartItems = []; }
    }
  }

  payViaPSE(): void {
    if (!this.tipoCliente) {
      this.notify.error('Debes seleccionar el tipo de cliente.');
      return;
    }
    if (!this.identificacionCliente.trim()) {
      this.notify.error('Debes ingresar tu número de identificación.');
      return;
    }
    if (!this.bancoSeleccionado) {
      this.notify.error('Debes elegir un banco.');
      return;
    }
    if (!this.cartItems.length) {
      this.notify.error('Tu carrito está vacío.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.notify.error('No estás autenticado. Por favor inicia sesión.');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    // Obtener la ventaId guardada al crear la venta (debe estar en localStorage)
    const ventaId = localStorage.getItem('ventaId');
    if (!ventaId) {
      this.notify.error('No se encontró la venta a procesar. Por favor realiza la compra primero.');
      return;
    }

    this.isLoading = true;

    // Buscar transacción asociada a la venta
    this.http.get<any>(`${this.BASE_API}/transaccion/findByCompra/${ventaId}`, { headers })
      .subscribe({
        next: (transaccion) => {
          if (!transaccion || !transaccion.id) {
            this.notify.error('No se encontró la transacción a actualizar.');
            this.isLoading = false;
            return;
          }
          // Actualizar datos de transacción con lo ingresado por el usuario
          const payloadTx = {
            ...transaccion, // toma todos los campos, y sobreescribe los necesarios
            idBanco: this.bancoSeleccionado,
            identificacion: this.identificacionCliente,
            estado: 1 // o el estado correspondiente
          };

          // ACTUALIZA por POST a /transaccion/saveTransaccion
          this.http.post(`${this.BASE_API}/transaccion/saveTransaccion`, payloadTx, { headers })
            .subscribe({
              next: () => {
                localStorage.removeItem(this.getCartKey());
                this.isLoading = false;
                this.notify.success('Pago exitoso', 'Tu pasarela PSE ha procesado la transacción correctamente.');
                this.router.navigate(['/usuario/vinilos']);
              },
              error: (err) => {
                this.notify.error('Error al actualizar la transacción: ' + (err.error || err.message || ''));
                this.isLoading = false;
              }
            });
        },
        error: (err) => {
          this.notify.error('No se pudo obtener la transacción de la venta. ' + (err.error || err.message || ''));
          this.isLoading = false;
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/usuario/carrito']);
  }
}
