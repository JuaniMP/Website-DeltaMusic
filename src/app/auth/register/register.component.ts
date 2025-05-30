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
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../auth.service';

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
    private toastr: ToastrService
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
      return timer(500).pipe(
        switchMap(() => this.auth.checkEmail(control.value)),
        map(isTaken => isTaken ? { emailTaken: true } : null),
        catchError(() => of(null))
      );
    };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarToast('error', 'Por favor corrige los errores.', 'Formulario inválido');
      return;
    }

    const { nombre, apellidos, correoUsuario } = this.form.value;
    const loginUsrio = correoUsuario.trim().toLowerCase();

    this.auth.register({ nombre, apellidos, correoUsuario, loginUsrio }).subscribe({
      next: () => {
        this.mostrarToast('success', '¡Registro exitoso!', 'Éxito');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.f['correoUsuario'].setErrors({ emailTaken: true });
          this.mostrarToast('error', 'Este correo ya está registrado.', 'Correo duplicado');
        } else {
          this.mostrarToast('error', 'Error al registrar. Intenta más tarde.', 'Error del servidor');
        }
      }
    });
  }

  private mostrarToast(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string, titulo?: string): void {
    switch (tipo) {
      case 'success':
        this.toastr.success(mensaje, titulo || 'Éxito');
        break;
      case 'error':
        this.toastr.error(mensaje, titulo || 'Error');
        break;
      case 'info':
        this.toastr.info(mensaje, titulo || 'Información');
        break;
      case 'warning':
        this.toastr.warning(mensaje, titulo || 'Advertencia');
        break;
    }
  }
}
