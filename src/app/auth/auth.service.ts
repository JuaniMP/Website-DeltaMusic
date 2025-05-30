import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8181/usuario';

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
  // src/app/auth/auth.service.ts
// src/app/auth/auth.service.ts
requestPasswordReset(email: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/forgot`,
      { correoUsuario: email },           // ← coincide con lo que lee el controlador
      { responseType: 'text' } as const    // ← devuelve texto, no JSON
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

  // src/app/auth/auth.service.ts
getRole(): 'admin' | 'user' | null {
  const tipo = this.getUser()?.idTipoUsuario;
  if (tipo === 'A') {
    return 'admin';
  }
  // Aceptamos tanto 'U' como '2' (o el valor que uses para usuarios normales)
  if (tipo === 'U' || tipo === '2') {
    return 'user';
  }
  return null;
}


  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false; // No hay token, no está autenticado
    }

    try {
      const decoded: any = jwtDecode(token); // Decodifica el token
      const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
      return decoded.exp > currentTime; // Verifica si el token no ha expirado
    } catch (error) {
      return false; // Si el token no es válido, no está autenticado
    }
  }
}
