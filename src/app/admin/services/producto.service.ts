// src/app/admin/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'http://localhost:8181/producto';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/getAll`);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/findRecord/${id}`);
  }

  save(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/saveProducto`, producto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteProducto/${id}`);
  }
}
