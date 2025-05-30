// src/app/usuario/usuario.component.ts
import { Component, OnInit }     from '@angular/core';
import { CommonModule }          from '@angular/common';
import { Router }                from '@angular/router';
import { AuthService }           from '../auth/auth.service';
import { NotificationService }   from '../shared/notification.service';

import { VinilosComponent }      from './vinilos/vinilos.component';
import { CdsComponent }          from './cds/cds.component';
import { ProductoService }       from './producto/producto.service';
import { Producto }              from './producto/producto.model';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [ CommonModule, VinilosComponent, CdsComponent ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  section: 'vinilo' | 'cd' = 'vinilo';

  viniloMostSold: Producto[] = [];
  viniloByGenre:   Producto[] = [];
  cdMostSold:      Producto[] = [];
  cdByGenre:       Producto[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService,
    private productoSvc: ProductoService
  ) {}

  ngOnInit(): void {
    this.productoSvc.getAll().subscribe(products => {
      const vinilos = products.filter(p => p.tipo === 'vinilo');
      const cds     = products.filter(p => p.tipo === 'cd');

      this.viniloMostSold = vinilos;
      this.viniloByGenre  = vinilos;
      this.cdMostSold     = cds;
      this.cdByGenre      = cds;
    });
  }

  switchView(sec: 'vinilo' | 'cd'): void {
    this.section = sec;
  }

  onAddToCart(p: Producto): void {
    this.notify.success('Añadido al carrito', `"${p.descripcion}" se añadió correctamente.`);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.notify.info('Sesión cerrada');
  }
   /** Método que abre o muestra el carrito */
  openCart(): void {
    // Por ejemplo, navegas a /carrito o muestras modal
    this.router.navigate(['/carrito']);
    this.notify.info('Carrito', 'Aquí verás tus productos');
  }
  
}
