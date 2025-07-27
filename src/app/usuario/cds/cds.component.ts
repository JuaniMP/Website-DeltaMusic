import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';
import { environment } from '../../../environments/environment';  // Importa las variables de entorno

interface Producto {
  id: number;
  idCategoria: number; // 3 = CD (inglés), 4 = CD (español)
  referencia: string;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  precioVentaAnterior: number;
  costoCompra: number;
  tieneIva: number;     // 1 = sí, 0 = no
  stockMaximo: number;
  fotoProducto: string;
  estado: number;       // 1 = activo, 0 = inactivo
}

interface CartItem {
  product: Producto;
  quantity: number;
}

@Component({
  selector: 'app-cds',
  standalone: true,
  imports: [ CommonModule, HttpClientModule, RouterModule ],
  templateUrl: './cds.component.html',
  styleUrls: ['./cds.component.css']
})
export class CdsComponent implements OnInit {
  cdMostSold: Producto[] = [];
  cdByGenre:    Producto[] = [];
  loading = true;
  errorMsg: string | null = null;

  // Cantidades de cada CD en pantalla
  quantities: { [productId: number]: number } = {};

  // Construimos la URL completa dinámicamente 
  private readonly API_URL = environment.API_URL + '/producto/getAll';

  constructor(
    private http: HttpClient,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.http.get<Producto[]>(this.API_URL).subscribe({
      next: productos => {
        this.cdMostSold = productos.filter(p => p.idCategoria === 3 && p.estado === 1);
        this.cdByGenre  = productos.filter(p => p.idCategoria === 4 && p.estado === 1);

        [...this.cdMostSold, ...this.cdByGenre].forEach(p => {
          this.quantities[p.id] = 0;
        });
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar CDs', err);
        this.errorMsg = 'No pudimos cargar los CDs. Intenta más tarde.';
        this.loading = false;
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

  private getCartFromLocalStorage(): CartItem[] {
    const key = this.getCartKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }

  private saveCartToLocalStorage(cart: CartItem[]) {
    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }

  private getTotalItemsInCart(): number {
    const cart = this.getCartFromLocalStorage();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  incrementQuantity(p: Producto) {
    const current = this.quantities[p.id] || 0;
    const cartTotal = this.getTotalItemsInCart();

    if (cartTotal >= 3) {
      this.notify.error('Solo puedes llevar un máximo de 3 unidades en el carrito.');
      return;
    }

    const maxForThis = Math.min(3, p.existencia, p.stockMaximo);
    if (current < maxForThis) {
      this.quantities[p.id] = current + 1;
    }
  }

  decrementQuantity(p: Producto) {
    const current = this.quantities[p.id] || 0;
    if (current > 0) {
      this.quantities[p.id] = current - 1;
    }
  }

  addToCart(p: Producto) {
    const qty = this.quantities[p.id] || 0;
    if (qty <= 0) return;

    const cart = this.getCartFromLocalStorage();
    const existingIndex = cart.findIndex(item => item.product.id === p.id);

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + qty;
      if (newQty > 3) {
        this.notify.error('La suma total de este CD supera el máximo de 3 unidades.');
        return;
      }
      cart[existingIndex].quantity = newQty;
    } else {
      cart.push({ product: p, quantity: qty });
    }

    this.saveCartToLocalStorage(cart);
    this.router.navigate(['/carrito']);
  }
}
