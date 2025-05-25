import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { AppComponent }        from './app.component';
import { AppRoutingModule }    from './app-routing.module';

import { LoginComponent }      from './auth/login.component';
import { NotFoundComponent }   from './common/not-found.component';

import { HttpClientModule }    from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Importa el componente standalone
import { RegisterComponent }   from './auth/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RegisterComponent // Importa el componente standalone aquí
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
