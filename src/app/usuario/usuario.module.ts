// src/app/usuario/usuario.module.ts
import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule }     from '@angular/router';

import { UsuarioComponent }       from './usuario.component';
import { UsuarioRoutingModule }   from './usuario-routing.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    UsuarioComponent,
    UsuarioRoutingModule,
    RouterModule     // Necesario para los routerLink si se usan en módulos secundarios
  ]
})
export class UsuarioModule {}
