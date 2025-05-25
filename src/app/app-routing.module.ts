import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent }        from './auth/login.component';
import { RegisterComponent }     from './auth/register/register.component';  // Ajusta si tu .ts está en otra ruta
import { NotFoundComponent }     from './common/not-found.component';
import { RoleGuard }             from './auth/role.guard';
import { AuthRedirectGuard }     from './auth/auth-redirect.guard';

const routes: Routes = [
  // Si van a '/' redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Pantalla de login (impide entrar si ya estás autenticado)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard]
  },

  // Pantalla de registro (igual, no deja entrar si ya estás logueado)
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthRedirectGuard]
  },

  // Lazy‐load del módulo de usuario, solo si está autenticado
  {
    path: 'usuario',
    canActivate: [RoleGuard],
    loadChildren: () =>
      import('./usuario/usuario.module').then(m => m.UsuarioModule)
  },

  // Cualquier otra ruta → NotFound
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}


