// src/app/admin/services/auditoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria } from '../models/auditoria.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  // Usamos la URL base desde environment, y concatenamos la ruta específica
  private baseUrl = environment.API_URL + '/auditoria';

  constructor(private http: HttpClient) {}

  /** Trae todas las auditorías */
  getAll(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(`${this.baseUrl}/getAll`);
  }

  /** Trae una auditoría por su ID */
  getById(id: number): Observable<Auditoria> {
    return this.http.get<Auditoria>(`${this.baseUrl}/findRecord/${id}`);
  }
}
