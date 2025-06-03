// src/app/app.module.ts
import { NgModule }                  from '@angular/core';
import { BrowserModule }             from '@angular/platform-browser';
import { BrowserAnimationsModule }   from '@angular/platform-browser/animations';
import { HttpClientModule }          from '@angular/common/http';
import { ReactiveFormsModule }       from '@angular/forms';

import { AppComponent }              from './app.component';
import { AppRoutingModule }          from './app-routing.module';

// Standalone components
import { LoginComponent }            from './auth/login.component';
import { RegisterComponent }         from './auth/register/register.component';
import { ForgotComponent }           from './auth/forgot/forgot.component';
import { CarritoComponent }       from './carrito/carrito.component';
import { VinilosComponent }       from './usuario/vinilos/vinilos.component';
import { CdsComponent }           from './usuario/cds/cds.component';
import { FooterComponent } from './shared/footer/footer.component';

// Other declarations
import { NotFoundComponent }         from './common/not-found.component';

// Toastr for global notifications
import { ToastrModule }              from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,

    // Standalone routing components
    RegisterComponent,
    LoginComponent,
    CarritoComponent,
    VinilosComponent,
    CdsComponent,
    RegisterComponent,
    ForgotComponent,
    FooterComponent,
    // Toast notifications
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 4000,
      closeButton: false,
      progressBar: true,
      toastClass: 'ngx-toastr custom-toast'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
