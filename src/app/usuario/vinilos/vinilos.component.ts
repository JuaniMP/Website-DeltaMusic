// src/app/usuario/vinilos/vinilos.component.ts
import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule }         from '@angular/router';

interface Producto {
  id: number;
  idCategoria: number;         // 1 = vinilo
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
  selector: 'app-vinilos',
  standalone: true,
  imports: [ CommonModule, HttpClientModule, RouterModule ],
  templateUrl: './vinilos.component.html',
  styleUrls: ['./vinilos.component.css']
})
export class VinilosComponent implements OnInit {
  viniloMostSold: Producto[] = [];
  viniloByGenre: Producto[]  = [];
  loading = true;
  errorMsg: string | null = null;

  private readonly API_URL = 'http://localhost:8181/producto/getAll';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Producto[]>(this.API_URL).subscribe({
      next: productos => {
        const todosVinilos = productos.filter(
          p => p.idCategoria === 1 && p.estado === 1
        );
        this.viniloMostSold = todosVinilos;
        this.viniloByGenre  = todosVinilos;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar vinilos', err);
        this.errorMsg = 'No pudimos cargar los vinilos. Intenta más tarde.';
        this.loading = false;
      }
    });
  }
}
