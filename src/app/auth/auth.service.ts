// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';  // Ajusta la ruta según ubicación real

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Aquí concatenamos la base URL dinámica con el path específico /usuario
  private apiUrl = environment.API_URL + '/usuario';

  constructor(private http: HttpClient) {}

  login(credentials: { correo: string; clave: string }) {
    return this.http
      .post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify(res.usuario));
        })
      );
  }

  register(data: {
    nombre: string;
    apellidos: string;
    correoUsuario: string;
    loginUsrio: string;
  }) {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/saveUsuario`,
      data
    );
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/existsByEmail/${encodeURIComponent(email)}`
    );
  }

  requestPasswordReset(email: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/forgot`,
      { correoUsuario: email },
      { responseType: 'text' } as const
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): any {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): 'admin' | 'user' | null {
    const tipo = this.getUser()?.idTipoUsuario;
    if (tipo === 'A') {
      return 'admin';
    }
    if (tipo === 'U' || tipo === '2') {
      return 'user';
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }
}
