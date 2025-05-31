// src/app/usuario/cds/cds.component.ts
import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule }         from '@angular/router';

interface Producto {
  id: number;
  idCategoria: number;         // 2 = cd
  referencia: string;
  descripcion: string;
  existencia: number;
  precioVentaActual: number;
  precioVentaAnterior: number;
  costoCompra: number;
  tieneIva: number;
  stockMaximo: number;
  fotoProducto: string;
  estado: number;              // 1 = activo, 0 = inactivo
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
  cdByGenre: Producto[]  = [];
  loading = true;
  errorMsg: string | null = null;

  private readonly API_URL = 'http://localhost:8181/producto/getAll';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Producto[]>(this.API_URL).subscribe({
      next: productos => {
        const todosCds = productos.filter(
          p => p.idCategoria === 2 && p.estado === 1
        );
        this.cdMostSold = todosCds;
        this.cdByGenre  = todosCds;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar CDs', err);
        this.errorMsg = 'No pudimos cargar los CDs. Intenta más tarde.';
        this.loading = false;
      }
    });
  }
}
