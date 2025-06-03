// src/app/usuario/pse/pse.component.ts

import { Component, OnInit }             from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { FormsModule }                   from '@angular/forms';
import { HttpClient, HttpClientModule }  from '@angular/common/http';
import { Router, RouterModule }          from '@angular/router';
import { forkJoin, of }                  from 'rxjs';
import { catchError, switchMap, map }    from 'rxjs/operators';
import { NotificationService }           from '../../shared/notification.service';

interface Producto {
  id: number;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  tieneIva: number;     // 1 = sí, 0 = no
}

interface Cliente {
  id: number;
  correoCliente: string;
  // otros campos si los necesitas...
}

interface CartItem {
  product: Producto;
  quantity: number;
}

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

  // 1) ID de transacción que se muestra en pantalla (solo visual)
  transactionId: string = '';

  // 2) Email del usuario logueado (se muestra arriba)
  userEmail: string = '';

  // 3) Tipo de Cliente: lo inicializamos en vacío para que aparezca el placeholder
  tipoCliente: '' | 'Persona Natural' | 'Persona Jurídica' = '';

  // 4) Identificación (se enviará en transacción.identificacion)
  identificacionCliente: string = '';

  // 5) Opciones para el select de Tipo de Cliente
  listaTiposCliente: Array<'Persona Natural' | 'Persona Jurídica'> = [
    'Persona Natural',
    'Persona Jurídica'
  ];

  // 6) Banco seleccionado
  bancoSeleccionado: string = '';

  // 7) Lista de bancos disponibles
  bancosDisponibles: string[] = [
    'Banco de Colombia',
    'Bancolombia',
    'Banco Davivienda',
    'Banco BBVA',
    'Banco Itaú'
  ];

  // 8) Control del spinner (true = muestro overlay, false = quito el blur)
  isLoading: boolean = false;

  // 9) Artículos del carrito (se cargan desde localStorage)
  cartItems: CartItem[] = [];

  // 10) URLs base del backend
  private readonly BASE_API        = 'http://localhost:8181';
  private readonly CLIENTE_ALL_API = `${this.BASE_API}/cliente/getAll`;
  private readonly VENTA_API       = `${this.BASE_API}/venta/saveVenta`;
  private readonly TRANSACCION_API = `${this.BASE_API}/transaccion/saveTransaccion`;
  private readonly PRODUCTO_API    = `${this.BASE_API}/producto/saveProducto`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    // Generar un ID aleatorio para mostrar en pantalla (solo visual)
    this.transactionId = 'TX-' + Math.floor(Math.random() * 1_000_000_000);

    // Recuperar datos del usuario desde localStorage (clave: "auth_user")
    const rawUser = localStorage.getItem('auth_user');
    if (rawUser) {
      try {
        // Se asume que auth_user = { id: number, email: string, tipoCliente?: string, … }
        const user = JSON.parse(rawUser) as { email: string; id: number; tipoCliente?: string };
        this.userEmail = user.email || '';
        // Si el JSON contiene tipoCliente, lo dejamos; si no, queda vacío para el placeholder
        if (user.tipoCliente === 'Persona Jurídica') {
          this.tipoCliente = 'Persona Jurídica';
        } else if (user.tipoCliente === 'Persona Natural') {
          this.tipoCliente = 'Persona Natural';
        } else {
          this.tipoCliente = '';
        }
      } catch {
        this.userEmail = '';
        this.tipoCliente = '';
      }
    } else {
      // Si no hay auth_user, dejar vacío para que muestre placeholder
      this.userEmail = '';
      this.tipoCliente = '';
    }

    // Cargar ítems del carrito desde localStorage
    this.loadCartItems();
  }

  /**
   * Devuelve la clave en localStorage para el carrito de este usuario.
   * Si no hay usuario, devuelve "cart_anonymous".
   */
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

  /** Carga el carrito desde localStorage bajo la clave dinámica. */
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

  /**
   * Se dispara al hacer clic en “Continuar con PSE”.
   * Flujo:
   *   1) Validar campos (tipoCliente, identificación, banco, carrito).
   *   2) Mostrar spinner (isLoading = true).
   *   3) GET → /cliente/getAll → filtrar por correoUsuario.
   *   4) POST → /venta/saveVenta → crear la venta con detalles del carrito.
   *   5) El backend devuelve idVenta (entero). Entonces:
   *      POST → /transaccion/saveTransaccion → crear transacción con idCompra = idVenta.
   *   6) Actualizar stock de cada producto comprado.
   *   7) Al final: ocultar spinner, eliminar carrito y redirigir a /usuario/vinilos.
   */
  payViaPSE(): void {
    // 1) Validaciones de formulario
    if (!this.tipoCliente) {
      this.notify.error('Debes seleccionar el tipo de cliente.');
      return;
    }
    if (!this.identificacionCliente.trim()) {
      this.notify.error('Debes ingresar tu número de identificación.');
      return;
    }
    if (!this.bancoSeleccionado) {
      this.notify.error('Debes elegir un banco para continuar con PSE.');
      return;
    }
    if (this.cartItems.length === 0) {
      this.notify.error('Tu carrito está vacío.');
      return;
    }

    // 2) Mostrar spinner
    const inicio = Date.now();
    this.isLoading = true;

    // 3) Obtener todos los clientes y filtrar por correoUsuario
    this.http.get<Cliente[]>(this.CLIENTE_ALL_API).pipe(
      catchError(err => {
        this.notify.error('Error al obtener lista de clientes.');
        this.isLoading = false;
        return of(null);
      }),
      switchMap(clientes => {
        if (!clientes) {
          throw new Error('Lista de clientes vacía');
        }
        // Buscar el cliente cuyo correoCliente coincida con this.userEmail
        const clienteEncontrado = clientes.find(c => c.correoCliente === this.userEmail);
        if (!clienteEncontrado) {
          throw new Error('No se encontró ningún cliente con el correo: ' + this.userEmail);
        }
        const idCliente = clienteEncontrado.id;

        // 4) Calcular totales de la venta
        let subtotal = 0;
        let totalIva = 0;
        let totalDscto = 0;
        this.cartItems.forEach(item => {
          const linea = item.product.precioVentaActual * item.quantity;
          subtotal += linea;
          if (item.product.tieneIva === 1) {
            totalIva += Math.round(linea * 0.19);
          }
          // (Si hubiera lógica de descuento, se acumularía en totalDscto)
        });

        // 4) Crear la venta (sin transacción)
        const ventaPayload = {
          venta: {
            idCliente:  idCliente,
            valorVenta: subtotal,
            valorIva:   totalIva,
            valorDscto: totalDscto,
            estado:     1,            // 1 = venta activa
            fechaVenta: new Date()
          },
          detalles: this.cartItems.map(item => ({
            idProducto: item.product.id,
            cantComp:   item.quantity,
            valorUnit:  item.product.precioVentaActual,
            valorIva:   (item.product.tieneIva === 1)
                           ? Math.round(item.product.precioVentaActual * item.quantity * 0.19)
                           : 0,
            valorDscto: 0
          }))
        };

        return this.http.post<{ idVenta: number }>(this.VENTA_API, ventaPayload).pipe(
          catchError(err => {
            this.notify.error('Error al crear venta.');
            this.isLoading = false;
            return of(null);
          }),
          map(res => {
            if (!res) {
              throw new Error('La venta no se creó correctamente');
            }
            return res.idVenta;
          })
        );
      }),
      switchMap(idVenta => {
        // 5) Crear Transacción usando idCompra = idVenta (entero)
        const transaccionPayload = {
          fechaHora:      new Date(),
          identificacion: this.identificacionCliente,
          valorTx:        this.cartItems.reduce(
                            (sum, item) => sum + item.product.precioVentaActual * item.quantity,
                            0
                          ),
          idMetodoPago:   5,
          idBanco:        this.bancoSeleccionado,
          idFranquicia:   'NA',
          numTarjeta:     'NA',
          estado:         1,
          idCompra:       idVenta   // <-- Solo el ID numérico de la venta
        };
        return this.http.post<{ id: number }>(this.TRANSACCION_API, transaccionPayload).pipe(
          catchError(err => {
            this.notify.error('Error al crear transacción.');
            this.isLoading = false;
            return of(null);
          })
        );
      }),
      switchMap(transRes => {
        if (!transRes) {
          return of(null);
        }
        // 6) Actualizar stock de cada producto comprado
        const llamadasUpdate = this.cartItems.map(item => {
          return this.http
            .get<Producto>(`${this.BASE_API}/producto/getById/${item.product.id}`)
            .pipe(
              switchMap(prodExistente => {
                prodExistente.existencia = prodExistente.existencia - item.quantity;
                return this.http.post(`${this.PRODUCTO_API}`, prodExistente);
              }),
              catchError(err => {
                console.error('Error al actualizar stock', err);
                return of(null);
              })
            );
        });
        return forkJoin(llamadasUpdate);
      })
    ).subscribe({
      next: () => {
        // 7) Esperar al menos 4 segundos en total (si faltan, usar setTimeout)
        const transcurrido = Date.now() - inicio;
        const espera = 4000 - transcurrido;
        if (espera > 0) {
          setTimeout(() => this.finalizarPago(), espera);
        } else {
          this.finalizarPago();
        }
      },
      error: () => {
        this.notify.error('Error inesperado al procesar el pago.');
        this.isLoading = false;
      }
    });
  }

  private finalizarPago(): void {
    // Eliminar carrito (por clave dinámica)
    const key = this.getCartKey();
    localStorage.removeItem(key);

    this.isLoading = false;
    this.notify.success(
      'Pago exitoso',
      'Tu pasarela PSE ha procesado la transacción correctamente.'
    );
    // Redirigir a la lista de vinilos
    this.router.navigate(['/usuario/vinilos']);
  }

  cancelar(): void {
    this.router.navigate(['/usuario/carrito']);
  }
}
