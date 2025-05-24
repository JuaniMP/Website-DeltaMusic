import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8181/usuario/login';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  login(credentials: { correo: string; clave: string }) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.usuario));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const raw = localStorage.getItem(this.userKey);
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
