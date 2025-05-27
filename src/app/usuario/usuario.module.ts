import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { UsuarioComponent } from './usuario.component';

const routes = [
  { path: '', component: UsuarioComponent }
];

@NgModule({
  imports: [
    CommonModule,
    UsuarioComponent,      // componente standalone
    RouterModule.forChild(routes)
  ]
})
export class UsuarioModule {}
