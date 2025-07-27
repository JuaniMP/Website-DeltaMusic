// src/app/admin/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment'; // Ajusta la ruta si tu estructura es distinta

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Usamos la URL base del environment para apuntar al backend correcto
  private baseUrl = environment.API_URL + '/usuario';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los usuarios */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAll`);
  }

  /** Obtiene un usuario por su ID */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/findRecord/${id}`);
  }

  /** Crea un usuario o lo actualiza si ya existe (según id) */
  save(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/saveUsuario`, user);
  }

  /**
   * Actualiza un usuario existente.
   * El backend distingue creación / actualización por la presencia de user.id.
   */
  update(id: number, user: User): Observable<User> {
    // Asegúrate de que user.id === id (no estrictamente necesario si el objeto ya lo trae)
    user.id = id;
    return this.save(user);
  }
}
