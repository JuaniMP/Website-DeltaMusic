import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { NotFoundComponent } from './common/not-found.component';
import { RoleGuard } from './auth/role.guard';
import { AuthRedirectGuard } from './auth/auth-redirect.guard';

const routes: Routes = [
  // Redirige '' a '/login'
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Pantalla de login (impide entrar si ya está autenticado)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard]
  },

  // Rutas protegidas de usuario (lazy-loaded)
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
  exports: [RouterModule],
})
export class AppRoutingModule {}
