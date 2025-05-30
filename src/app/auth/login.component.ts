// src/app/auth/login.component.ts
import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { AuthService } from './auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string | null = null;
  passwordFieldType: 'password' | 'text' = 'password';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave:  ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.value).subscribe({
      next: () => {
        // Redirige según rol
        const role = this.auth.getRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/usuario']);
        }
      },
      error: err => {
        const error = err.error;
        if (typeof error === 'string') {
          this.errorMessage = error;
        } else if (error && typeof error === 'object') {
          this.errorMessage = Object.values(error).join('\n');
        } else {
          this.errorMessage = 'Ocurrió un error al iniciar sesión.';
        }
      }
    });
  }

  togglePassword() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
