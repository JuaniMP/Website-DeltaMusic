import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  requestPasswordReset(email: string) {
  return this.http.post(`${this.apiUrl}/forgot-password`, { correoUsuario: email });
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
    return tipo === 'A' ? 'admin' : tipo === 'U' ? 'user' : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
