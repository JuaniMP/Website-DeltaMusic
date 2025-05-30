// src/app/usuario/usuario.module.ts
import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';
import { HttpClientModule } from '@angular/common/http';    // ←
import { RouterModule }     from '@angular/router';
import { UsuarioComponent } from './usuario.component';

const routes = [{ path: '', component: UsuarioComponent }];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,           // ← necesario
    UsuarioComponent,
    RouterModule.forChild(routes)
  ]
})
export class UsuarioModule {}
