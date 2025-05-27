// src/app/auth/forgot/forgot.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {
  form: FormGroup;
  submitting = false;
  message = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      correoUsuario: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const email = this.form.value.correoUsuario.trim().toLowerCase();

    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.message = 'Te hemos enviado un correo con la contraseña temporal.';
        this.isError = false;
        this.submitting = false;
      },
      error: () => {
        this.message = 'No pudimos procesar tu petición. Intenta más tarde.';
        this.isError = true;
        this.submitting = false;
      }
    });
  }
}
