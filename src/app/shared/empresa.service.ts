import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta la ruta según tu estructura

export interface Empresa {
  id: number;
  razonSocial: string;
  direccion: string;
  correoElectronico: string;
  telefono: string;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  // Usar la base URL desde environment y concatenar la ruta de la API
  private readonly API_URL = environment.API_URL + '/empresa';

  constructor(private http: HttpClient) {}

  getEmpresa(): Observable<Empresa[]> {
    // Aquí llamamos al endpoint getAll con la URL completa
    return this.http.get<Empresa[]>(`${this.API_URL}/getAll`);
  }
}
