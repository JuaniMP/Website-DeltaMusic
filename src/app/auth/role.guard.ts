// src/app/auth/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    const needed = route.data['role'] as 'admin' | 'user' | undefined;
    const actual = this.auth.getRole();
    if (needed && actual !== needed) {
      // redirige al módulo apropiado
      this.router.navigate([ actual === 'admin' ? '/admin' : '/usuario' ]);
      return false;
    }
    return true;
  }
}
