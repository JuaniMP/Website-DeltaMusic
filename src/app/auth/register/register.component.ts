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
import { of, timer, Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClientModule } from '@angular/common/http';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,         // NgIf, NgClass, etc.
    ReactiveFormsModule,  // formGroup, formControlName, etc.
    RouterModule,         // para routerLink
    HttpClientModule      // para HttpClient en AuthService
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre:        ['', [Validators.required, Validators.minLength(2)]],
      apellidos:     ['', [Validators.required, Validators.minLength(2)]],
      correoUsuario: [
        '',
        [Validators.required, Validators.email],
        [this.emailTakenValidator()]
      ]
    });
  }

  get f() { return this.form.controls; }

  private triggerToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  private emailTakenValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (control.invalid || !control.value) {
        return of(null);
      }
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
      this.triggerToast('Por favor corrige los errores.', 'error');
      return;
    }

    const { nombre, apellidos, correoUsuario } = this.form.value;
    const loginUsrio = correoUsuario.trim().toLowerCase();

    this.auth
      .register({ nombre, apellidos, correoUsuario, loginUsrio })
      .subscribe({
        next: () => {
          this.triggerToast('¡Registro exitoso!', 'success');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.f['correoUsuario'].setErrors({ emailTaken: true });
            this.triggerToast('Este correo ya está registrado.', 'error');
          } else {
            this.triggerToast('Error al registrar, intenta más tarde.', 'error');
          }
        }
      });
  }
}
