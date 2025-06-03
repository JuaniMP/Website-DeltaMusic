import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Parametro {
  id: number;
  descripcion: string;
  valorNumero: number;
  valorTexto: string;
  fechaInicial: string; // formato: YYYY-MM-DD
  fechaFinal: string;   // formato: YYYY-MM-DD
  estado: number; // 1=activo, 0=inactivo
}

@Injectable({ providedIn: 'root' })
export class ParametroService {
  private apiUrl = 'http://localhost:8181/parametro';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Parametro[]> {
    return this.http.get<Parametro[]>(`${this.apiUrl}/getAll`);
  }
  save(parametro: Parametro): Observable<Parametro> {
    return this.http.post<Parametro>(`${this.apiUrl}/saveParametro`, parametro);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteParametro/${id}`);
  }
  getById(id: number): Observable<Parametro> {
    return this.http.get<Parametro>(`${this.apiUrl}/findRecord/${id}`);
  }
}

