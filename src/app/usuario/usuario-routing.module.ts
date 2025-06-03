// src/app/usuario/usuario-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsuarioComponent }      from './usuario.component';
import { VinilosComponent }      from './vinilos/vinilos.component';
import { CdsComponent }          from './cds/cds.component';
import { EditProfileComponent }  from './edit-profile/edit-profile.component';
import { PseComponent } from './pse/pse.component';
import { TarjetaComponent } from './tarjeta/tarjeta.component'; // si crearás la ruta “tarjeta”


const routes: Routes = [
  {
    path: '',
    component: UsuarioComponent,
    children: [
      // Al entrar a /usuario → carga VinilosComponent
      { path: '',             component: VinilosComponent },
      { path: 'cds',          component: CdsComponent },
      { path: 'edit-profile', component: EditProfileComponent },
      { path: 'pse',          component: PseComponent},
      { path: 'tarjeta',      component: TarjetaComponent},
      // Wildcard interno: si le dan a /usuario/xxx-raro → redirige a /usuario
      { path: '**',           redirectTo: '', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class UsuarioRoutingModule {}
