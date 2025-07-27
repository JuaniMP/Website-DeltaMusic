import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajusta la ruta relativa según tu estructura

// src/app/admin/services/method-payment.service.ts

export interface MetodoPago {
  id: number;
  descripcion: string; // CAMBIA nombre por descripcion
  estado: number; // 1=activo, 0=inactivo
}

@Injectable({
  providedIn: 'root'
})
export class MethodPaymentService {
  // Usamos la URL base dinámica desde el environment
  private apiUrl = environment.API_URL + '/metodo_pago';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/getAll`);
  }

  save(metodo: MetodoPago): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(`${this.apiUrl}/saveMetodoPago`, metodo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteMetodoPago/${id}`);
  }

  getById(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.apiUrl}/findRecord/${id}`);
  }
}
