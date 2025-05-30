// src/app/admin/components/product-list/product-list.component.ts
import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { RouterModule }         from '@angular/router';
import { ProductoService }      from '../../services/producto.service';
import { Producto }             from '../../models/producto.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productoService.getAll().subscribe({
      next: data => this.productos = data,
      error: err => console.error('Error cargando productos', err)
    });
  }

  deleteProduct(id?: number): void {
    if (id == null) {
      console.error('ID de producto no definido');
      return;
    }
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }
    this.productoService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: err => console.error('Error borrando producto', err)
    });
  }
}
