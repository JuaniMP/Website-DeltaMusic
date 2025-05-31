// src/app/usuario/usuario.component.ts
import { Component }            from '@angular/core';
import { CommonModule }         from '@angular/common';
import { Router }               from '@angular/router';      // ① Importar Router

import { AuthService }          from '../auth/auth.service';
import { NotificationService }  from '../shared/notification.service';

import { VinilosComponent }     from './vinilos/vinilos.component';
import { CdsComponent }         from './cds/cds.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    VinilosComponent,
    CdsComponent
  ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {
  section: 'vinilo' | 'cd' = 'vinilo';

  constructor(
    private auth: AuthService,
    private router: Router,                    // ② Inyectar Router aquí
    private notify: NotificationService
  ) {}

  switchView(sec: 'vinilo' | 'cd'): void {
    this.section = sec;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.notify.info('Sesión cerrada');
  }

  openCart(): void {
    this.router.navigate(['/carrito']);
    this.notify.info('Carrito', 'Aquí verás tus productos');
  }
}
