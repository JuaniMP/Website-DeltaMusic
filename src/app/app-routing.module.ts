// src/app/app-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// componentes standalone
import { LoginComponent }    from './auth/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotComponent }   from './auth/forgot/forgot.component';

// demás
import { NotFoundComponent }   from './common/not-found.component';
import { AuthRedirectGuard }   from './auth/auth-redirect.guard';
import { RoleGuard }           from './auth/role.guard';

const routes: Routes = [
  // 1) Redirección raíz
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2) Rutas de autenticación
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthRedirectGuard]
  },
  {
    path: 'forgot',
    component: ForgotComponent,
    canActivate: [AuthRedirectGuard]
  },

  // 3) Lazy-load de zonas protegidas
  {
    path: 'usuario',
    canActivate: [RoleGuard],
    data: { role: 'user' },
    loadChildren: () =>
      import('./usuario/usuario.module').then(m => m.UsuarioModule)
  },
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },

  // 4) Wildcard al final
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
