// src/app/admin/admin-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { UserListComponent }    from './components/user-list/user-list.component';
import { CreateUserComponent }  from './components/create-user/create-user.component';
import { AuditListComponent }   from './components/audit-list/audit-list.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { MethodPaymentListComponent } from './components/method-payment-list/method-payment-list.component';
import { ParametroListComponent } from './components/parametro-list/parametro-list.component';
import { StatisticsListComponent } from './components/statistics-list/statistics-list.component';
import { CreateMethodPaymentComponent } from './components/create-method-payment/create-method-payment.component';
import { CreateParametroComponent } from './components/create-parametro/create-parametro.component';


import { RoleGuard }            from '../auth/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' },
    children: [
      // Al entrar a /admin, redirige a /admin/users
      { path: '',          redirectTo: 'users',      pathMatch: 'full' },
      // Listado de usuarios
      { path: 'users',     component: UserListComponent },
      // Formulario para crear nuevo usuario
      { path: 'users/new', component: CreateUserComponent },

      { path: 'users/:id/edit', component: CreateUserComponent },

      { path: 'products',  component: ProductListComponent },

       { path: 'products/new',      component: CreateProductComponent },

      { path: 'products/:id/edit', component: CreateProductComponent },
      //
      // Listado de auditoría
      { path: 'audit',     component: AuditListComponent },

      { path: 'transactions', component: TransactionListComponent },
       { path: 'method-payments', component: MethodPaymentListComponent },
       { path: 'method-payments/new', component: CreateMethodPaymentComponent },
      { path: 'parametros', component: ParametroListComponent },
      { path: 'parametros/new', component: CreateParametroComponent },
      { path: 'stats', component: StatisticsListComponent },

      // Ruta comodín: redirige al listado de usuarios
      { path: '**',        redirectTo: 'users' }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule {}
