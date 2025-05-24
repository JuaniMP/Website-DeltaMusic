import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: [''],
      clave: [''],
    });
  }

  submit() {
    this.errorMessage = null;
  
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/usuario']);
      },
      error: (err) => {
        const error = err.error;
  
        if (typeof error === 'string') {
          this.errorMessage = error;
        } else if (typeof error === 'object' && error !== null) {
          this.errorMessage = Object.values(error).join('\n');
        } else {
          this.errorMessage = 'Error al iniciar sesión.';
        }
      }
    });
  }
  
  
}
