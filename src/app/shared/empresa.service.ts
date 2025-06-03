import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly API_URL = 'http://localhost:8181/empresa/getAll';

  constructor(private http: HttpClient) {}

  getEmpresa(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.API_URL);
  }
}
