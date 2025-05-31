import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  menuItems = [
    { label: 'Gestión de clientes', link: 'users' },
    { label: 'Gestión de productos', link: 'products' },
    { label: 'Consultar auditoría', link: 'audit' },
    { label: 'Estadísticas', link: 'stats' },
    { label: 'Lista de transacciones', link: 'transactions' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}