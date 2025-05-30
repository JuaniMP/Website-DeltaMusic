// src/app/admin/services/auditoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria }  from '../models/auditoria.model';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private baseUrl = 'http://localhost:8181/auditoria';

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
