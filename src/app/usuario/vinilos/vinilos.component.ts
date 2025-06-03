import { Component, OnInit }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule }        from '@angular/router';
import { NotificationService }         from '../../shared/notification.service';

interface Producto {
  id: number;
  idCategoria: number;        // 1 = vinilo (inglés), 2 = vinilo (español)
  referencia: string;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  precioVentaAnterior: number;
  costoCompra: number;
  tieneIva: number;           // 1 = sí, 0 = no
  stockMaximo: number;
  fotoProducto: string;
  estado: number;             // 1 = activo, 0 = inactivo
}

/** Cada elemento de carrito contendrá el producto completo + la cantidad elegida. */
interface CartItem {
  product: Producto;
  quantity: number;
}

@Component({
  selector: 'app-vinilos',
  standalone: true,
  imports: [ CommonModule, HttpClientModule, RouterModule ],
  templateUrl: './vinilos.component.html',
  styleUrls: ['./vinilos.component.css']
})
export class VinilosComponent implements OnInit {
  viniloMostSold: Producto[] = [];
  viniloByGenre:   Producto[] = [];
  loading = true;
  errorMsg: string | null = null;

  /** Mapa que guarda la cantidad seleccionada para cada producto en pantalla (inicialmente 0) */
  quantities: { [productId: number]: number } = {};

  private readonly API_URL = 'http://localhost:8181/producto/getAll';

  constructor(
    private http: HttpClient,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.http.get<Producto[]>(this.API_URL).subscribe({
      next: productos => {
        // Filtrar vinilos en inglés (idCategoria === 1)
        this.viniloMostSold = productos.filter(p => p.idCategoria === 1 && p.estado === 1);
        // Filtrar vinilos en español (idCategoria === 2)
        this.viniloByGenre   = productos.filter(p => p.idCategoria === 2 && p.estado === 1);

        // Inicializar las cantidades en 0 para cada vinilo
        [...this.viniloMostSold, ...this.viniloByGenre].forEach(p => {
          this.quantities[p.id] = 0;
        });
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar vinilos', err);
        this.errorMsg = 'No pudimos cargar los vinilos. Intenta más tarde.';
        this.loading = false;
      }
    });
  }

  /**
   *  Retorna la clave en localStorage para el carrito de ESTE usuario.
   *  Por ejemplo: si en "auth_user" está { id: 7, ... }, devolverá "cart_7".
   */
  private getCartKey(): string {
    const rawUser = localStorage.getItem('auth_user');
    if (!rawUser) {
      return 'cart_anonymous';
    }
    try {
      const user = JSON.parse(rawUser) as { id: number };
      return `cart_${user.id}`;
    } catch {
      return 'cart_anonymous';
    }
  }

  /** Obtiene el carrito de localStorage (clave dinámica por usuario). */
  private getCartFromLocalStorage(): CartItem[] {
    const key = this.getCartKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }

  /** Guarda el carrito actualizado en localStorage (clave dinámica). */
  private saveCartToLocalStorage(cart: CartItem[]) {
    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }

  /** Devuelve la cantidad total de unidades en el carrito (para este usuario). */
  private getTotalItemsInCart(): number {
    const cart = this.getCartFromLocalStorage();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Aumenta en 1 la cantidad seleccionada para ese vinilo,
   * siempre que no sobrepase el stock, ni stockMaximo, ni el límite global de 3 unidades.
   */
  incrementQuantity(p: Producto) {
    const current  = this.quantities[p.id] || 0;
    const cartTotal = this.getTotalItemsInCart();

    // Límite global total de 3 unidades
    if (cartTotal >= 3) {
      this.notify.error('Solo puedes llevar un máximo de 3 unidades en el carrito.');
      return;
    }

    // Límite por producto: mínimo entre 3, existencia y stockMaximo
    const maxForThis = Math.min(3, p.existencia, p.stockMaximo);
    if (current < maxForThis) {
      this.quantities[p.id] = current + 1;
    }
  }

  /**
   * Disminuye en 1 la cantidad seleccionada para ese vinilo,
   * sin que baje de 0.
   */
  decrementQuantity(p: Producto) {
    const current = this.quantities[p.id] || 0;
    if (current > 0) {
      this.quantities[p.id] = current - 1;
    }
  }

  /**
   * Al hacer clic en “Comprar”, agrega el vinilo con la cantidad
   * seleccionada al carrito en localStorage y redirige a /carrito.
   */
  addToCart(p: Producto) {
    const qty = this.quantities[p.id] || 0;
    if (qty <= 0) {
      return; // botón está deshabilitado si qty == 0
    }

    const cart = this.getCartFromLocalStorage();
    const existingIndex = cart.findIndex(item => item.product.id === p.id);

    if (existingIndex >= 0) {
      // Si ya estaba, actualizamos la cantidad sumando
      const newQty = cart[existingIndex].quantity + qty;
      if (newQty > 3) {
        this.notify.error('La suma total de este vinilo supera el máximo de 3 unidades.');
        return;
      }
      cart[existingIndex].quantity = newQty;
    } else {
      // Si no estaba, lo agregamos como nuevo ítem
      cart.push({ product: p, quantity: qty });
    }

    this.saveCartToLocalStorage(cart);
    // Redirigimos a /carrito
    this.router.navigate(['/carrito']);
  }
}
