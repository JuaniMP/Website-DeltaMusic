// src/app/auth/forgot/forgot.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { AuthService }    from '../auth.service';
import { NotificationService } from '../../shared/notification.service';

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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService
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

    // Mostrar toast de “enviando” inmediatamente
    this.notify.info('Enviando correo de recuperación…');

    this.auth.requestPasswordReset(email).subscribe({
      next: (msg: string) => {
        // Éxito: reemplaza el toast informativo por el de éxito
        this.notify.success('¡Correo enviado!', msg);
        this.form.reset();
        this.submitting = false;
      },
      error: () => {
        this.notify.error('Error', 'No pudimos procesar tu petición. Intenta más tarde.');
        this.submitting = false;
      }
    });
  }
}
