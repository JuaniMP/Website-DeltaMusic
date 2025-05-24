import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './auth/login.component';
import { NotFoundComponent } from './common/not-found.component'; 
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
