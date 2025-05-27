// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes standalone
import { LoginComponent }    from './auth/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotComponent }   from './auth/forgot/forgot.component';

// Otros componentes y guards
import { NotFoundComponent }  from './common/not-found.component';
import { RoleGuard }          from './auth/role.guard';
import { AuthRedirectGuard }  from './auth/auth-redirect.guard';

const routes: Routes = [
  { path: '',           redirectTo: 'login', pathMatch: 'full' },
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
  {
    path: 'usuario',
    canActivate: [RoleGuard],
    loadChildren: () =>
      import('./usuario/usuario.module').then(m => m.UsuarioModule)
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)  // <-- quitamos las opciones extras que daban error
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
