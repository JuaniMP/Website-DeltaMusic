// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  AsyncValidatorFn
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { NotificationService } from '../../shared/notification.service'; // Importa tu servicio

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService // Usa NotificationService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      correoUsuario: [
        '',
        [Validators.required, Validators.email],
        [this.emailTakenValidator()]
      ]
    });
  }

  get f() { return this.form.controls; }

  private emailTakenValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (control.invalid || !control.value) return of(null);
      // Si no tienes endpoint de validación asíncrona, solo retorna null.
      return of(null);
    };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Formulario inválido', 'Por favor corrige los errores.');
      return;
    }

    const { nombre, apellidos, correoUsuario } = this.form.value;
    const loginUsrio = correoUsuario.trim().toLowerCase();

    this.auth.register({ nombre, apellidos, correoUsuario, loginUsrio }).subscribe({
      next: () => {
        // Tu backend ya envía la clave temporal por correo
        this.notify.success(
          '¡Registro exitoso!',
          'Te hemos enviado una clave temporal al correo. Revisa también tu bandeja de spam.'
        );
        setTimeout(() => this.router.navigate(['/login']), 3500);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.f['correoUsuario'].setErrors({ emailTaken: true });
          this.notify.info(
            'Correo duplicado',
            'Este correo ya está registrado. Si olvidaste tu clave, usa "Recuperar contraseña".'
          );
        } else if (err.status === 0) {
          this.notify.error(
            'Error de conexión',
            'No pudimos conectar con el servidor. Intenta más tarde o contacta soporte.'
          );
        } else {
          this.notify.error(
            'Error del servidor',
            'Error inesperado al registrar. Intenta más tarde.'
          );
        }
      }
    });
  }
}
