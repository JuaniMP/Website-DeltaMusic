// src/app/usuario/usuario.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService }         from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule    // Necesitamos RouterModule para usar routerLink en el template
  ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.notify.info('Sesión cerrada');
  }

  goToVinilos(): void {
    this.router.navigate(['/usuario']);    // /usuario carga VinilosComponent por defecto
  }

  goToCds(): void {
    this.router.navigate(['/usuario/cds']);
  }

  goToEditProfile(): void {
    this.router.navigate(['/usuario/edit-profile']);
  }

  openCart(): void {
    this.router.navigate(['/carrito']);
    this.notify.info('Carrito', 'Aquí verás tus productos');
  }
}
