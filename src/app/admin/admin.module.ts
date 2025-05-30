// src/app/admin/admin.module.ts
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';

// Importa aquí tus componentes standalone
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { UserListComponent }    from './components/user-list/user-list.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminLayoutComponent,
    UserListComponent
  ]
})
export class AdminModule {}
