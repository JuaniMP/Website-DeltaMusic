import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { NotFoundComponent } from './common/not-found.component';
import { RoleGuard } from './auth/role.guard';
import { AuthRedirectGuard} from './auth/auth-redirect.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard]
  },  
  {
    path: 'usuario',
    canActivate: [RoleGuard],
    loadChildren: () => import('./usuario/usuario.module').then(m => m.UsuarioModule),
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
