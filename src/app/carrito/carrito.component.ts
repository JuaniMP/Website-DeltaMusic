import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../shared/notification.service';

interface Producto {
  id: number;
  idCategoria: number;
  referencia: string;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  precioVentaAnterior: number;
  costoCompra: number;
  tieneIva: number;
  stockMaximo: number;
  fotoProducto: string;
  estado: number;
}
interface CartItem { product: Producto; quantity: number; }
interface MetodoPago { id: number; descripcion: string; estado: number; }

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = false;
  errorMsg: string | null = null;
  showShipping = false;

  ivaPercent = 0;
  discountPercent = 0;

  subtotal = 0;
  totalIva = 0;
  discountAmount = 0;
  totalFinal = 0;

  shippingForm!: FormGroup;
  metodosPago: MetodoPago[] = [];

  private readonly API_PARAMETROS = 'http://localhost:8181/parametro/getAll';
  private readonly API_VENTA = 'http://localhost:8181/venta/saveVenta';
  private readonly API_CLIENTE = 'http://localhost:8181/cliente/saveCliente';
  private readonly API_METODOS_PAGO = 'http://localhost:8181/metodo_pago/getAll';

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMetodosPago();
    this.loadCartItems();
    this.loadParametros();

    this.shippingForm = this.fb.group({
      nombreCliente:    ['', [Validators.required, Validators.minLength(3)]],
      direccionCliente: ['', [Validators.required, Validators.minLength(5)]],
      correoCliente:    ['', [Validators.required, Validators.email]],
      telefono:         ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
      metodoPago:       [null, [Validators.required]]
    });

    // Prellenar correo si hay usuario logueado
    const rawUser = localStorage.getItem('auth_user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as { email?: string };
        if (user.email) {
          this.shippingForm.patchValue({ correoCliente: user.email });
        }
      } catch {}
    }
  }

  private loadMetodosPago() {
    this.http.get<MetodoPago[]>(this.API_METODOS_PAGO).subscribe({
      next: (data) => {
        this.metodosPago = data.filter(m => m.estado === 1);
      }
    });
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

  private loadCartItems() {
    const key = this.getCartKey();
    const raw = localStorage.getItem(key);
    this.cartItems = raw ? JSON.parse(raw) : [];
  }

  private saveCart() {
    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(this.cartItems));
  }

  private loadParametros() {
    this.http.get<any[]>(this.API_PARAMETROS).subscribe({
      next: params => {
        const ivaParam = params.find(p => p.descripcion === 'IVA' && p.estado === 1);
        this.ivaPercent = ivaParam?.valorNumero || 0;
        const discParam = params.find(p => p.descripcion === 'DESCUENTO' && p.estado === 1);
        this.discountPercent = discParam?.valorNumero || 0;
        this.calculateTotals();
      },
      error: err => {
        console.error('Error al cargar parámetros', err);
        this.errorMsg = 'No pudimos cargar los parámetros de IVA/Descuento.';
        this.ivaPercent = 0;
        this.discountPercent = 0;
        this.calculateTotals();
      }
    });
  }

  private calculateTotals() {
    const iva = this.ivaPercent || 0;
    const dscto = this.discountPercent || 0;
    const items = this.cartItems || [];

    this.subtotal = items.reduce((acc, item) => acc + (item.product.precioVentaActual || 0) * (item.quantity || 0), 0);

    this.totalIva = Math.round(
      items
        .filter(item => item.product.tieneIva === 1)
        .reduce((acc, item) =>
          acc + (item.product.precioVentaActual || 0) * (item.quantity || 0) * (iva / 100), 0)
    );

    this.discountAmount = Math.round(this.subtotal * (dscto / 100));
    this.totalFinal = this.subtotal + this.totalIva - this.discountAmount;
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.saveCart();
    this.calculateTotals();
  }

  incrementItem(index: number) {
    const item = this.cartItems[index];
    const cartTotal = this.cartItems.reduce((sum, it) => sum + it.quantity, 0);
    if (cartTotal >= 3) {
      this.notify.error('Máximo de 3 unidades permitido en el carrito.');
      return;
    }
    const maxQty = Math.min(3, item.product.existencia, item.product.stockMaximo);
    if (item.quantity < maxQty) {
      item.quantity += 1;
      this.saveCart();
      this.calculateTotals();
    } else {
      this.notify.error(`No puedes aumentar más. Stock disponible: ${item.product.existencia}`);
    }
  }

  decrementItem(index: number) {
    const item = this.cartItems[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.saveCart();
      this.calculateTotals();
    }
  }

  goBack() {
    this.router.navigate(['/usuario/vinilos']);
  }

  openShipping() {
    if (!this.cartItems.length) {
      this.notify.error('Tu carrito está vacío.');
      return;
    }
    this.showShipping = true;
    this.calculateTotals();
  }

  closeShippingModal() {
    this.showShipping = false;
    this.shippingForm.reset({
      nombreCliente: '',
      direccionCliente: '',
      correoCliente: '',
      telefono: '',
      metodoPago: null
    });
  }

  submitShipping() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    const token = localStorage.getItem('auth_token') || '';

    const correoBuscado = this.shippingForm.value.correoCliente.trim().toLowerCase();
    const payloadCliente: any = {
      nombreCliente: this.shippingForm.value.nombreCliente.trim(),
      direccionCliente: this.shippingForm.value.direccionCliente.trim(),
      correoCliente: correoBuscado,
      telefono: this.shippingForm.value.telefono.trim(),
      estado: 1
    };

    // Buscar si el cliente ya existe por correo
    this.http.get<any>(`http://localhost:8181/cliente/findByCorreo/${encodeURIComponent(correoBuscado)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (clienteExistente) => {
        payloadCliente.id = clienteExistente.id;
        this.http.post<{ id: number }>('http://localhost:8181/cliente/saveCliente', payloadCliente, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (clienteGuardado) => this.crearVentaConCliente(clienteGuardado.id),
          error: err => this.handleErrorCliente(err)
        });
      },
      error: err => {
        if (err.status === 404) {
          // No existe: CREA el cliente
          this.http.post<{ id: number }>('http://localhost:8181/cliente/saveCliente', payloadCliente, {
            headers: { Authorization: `Bearer ${token}` }
          }).subscribe({
            next: (clienteGuardado) => this.crearVentaConCliente(clienteGuardado.id),
            error: err2 => this.handleErrorCliente(err2)
          });
        } else {
          this.handleErrorCliente(err);
        }
      }
    });
  }

  private crearVentaConCliente(clienteId: number) {
    if (!clienteId) {
      this.notify.error('Error al crear/actualizar el cliente.');
      this.loading = false;
      return;
    }
    const idMetodoPago = this.shippingForm.value.metodoPago;

    // **GUARDAR el método de pago seleccionado en localStorage**
    localStorage.setItem('metodoPagoId', String(idMetodoPago));

    const payload = {
      venta: {
        idCliente: clienteId,
        detalles: this.cartItems.map(item => ({
          idProducto: item.product.id,
          cantComp: item.quantity
        })),
        fechaVenta: new Date()
      },
      transaccion: {
        idMetodoPago,
        idBanco: 'Bancolombia',
        idFranquicia: 'NA',
        numTarjeta: 'NA',
        identificacion: '123456789'
      }
    };

    const token = localStorage.getItem('auth_token') || '';
    this.http.post('http://localhost:8181/venta/saveVenta', payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.notify.success('Venta registrada correctamente.');
        localStorage.setItem('ventaId', String(res.id));
        this.showShipping = false;
        // Redirecciona según método de pago
        const metodoSel = this.metodosPago.find(m => m.id === idMetodoPago)?.descripcion?.toUpperCase() ?? '';
        if (metodoSel.includes('PSE')) {
          this.router.navigate(['/usuario/pse']);
        } else if (metodoSel.includes('TARJETA')) {
          this.router.navigate(['/usuario/tarjeta']);
        } else {
          this.router.navigate(['/usuario']);
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error al guardar la venta:', err);
        this.notify.error(err.error || 'Error al procesar la venta.');
        this.loading = false;
      }
    });
  }

  private handleErrorCliente(err: any) {
    console.error('Error al crear/actualizar cliente:', err);
    this.notify.error('No se pudo crear/actualizar el cliente.');
    this.loading = false;
  }
}
