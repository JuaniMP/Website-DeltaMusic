import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajusta este path relativo según dónde esté tu servicio

export interface Parametro {
  id: number;
  descripcion: string;
  valorNumero: number;
  valorTexto: string;
  fechaInicial: string; // formato: YYYY-MM-DD
  fechaFinal: string;   // formato: YYYY-MM-DD
  estado: number;       // 1=activo, 0=inactivo
}

@Injectable({ providedIn: 'root' })
export class ParametroService {
  // La URL base se toma desde environment para producción o desarrollo
  private apiUrl = environment.API_URL + '/parametro';

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
