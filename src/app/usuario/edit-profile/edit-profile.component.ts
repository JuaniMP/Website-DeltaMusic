// src/app/usuario/components/edit-profile/edit-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NotificationService } from '../../shared/notification.service';
import { environment } from '../../../environments/environment';  // Importar environment

interface Usuario {
  id?: number;
  correoUsuario: string;
  loginUsrio?: string;
  claveUsrio?: string;        // Nueva contraseña (solo si se modifica)
  idTipoUsuario?: string;     // Ej: "2"
  estado?: number;            // Ej: 1
  intentos?: number;          // Ej: 0
  fchaUltmaClave?: string;    // ISO date
}

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form: FormGroup;
  loading = true;
  errorMsg: string | null = null;
  showPasswordFields = false;

  // Cambiar la URL base para que tome la variable desde environment
  private readonly USUARIO_API = environment.API_URL + '/usuario';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notify: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correoUsuario:    ['', [Validators.required, Validators.email]],
      claveUsrio:       ['', [this.passwordConditionalValidator()]],
      confirmPassword:  ['', [this.matchPasswordValidator('claveUsrio')]]
    });
  }

  ngOnInit(): void {
    const rawUsuario = localStorage.getItem('auth_user');
    if (!rawUsuario) {
      this.errorMsg = 'No se encontró información de perfil.';
      this.loading = false;
      return;
    }
    const usuarioActual: any = JSON.parse(rawUsuario);

    // Pre‐llenar el campo "correoUsuario"
    this.form.patchValue({
      correoUsuario: usuarioActual.correoUsuario || ''
    });
    this.loading = false;
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;

    const claveCtrl = this.form.get('claveUsrio')!;
    const confirmCtrl = this.form.get('confirmPassword')!;

    if (this.showPasswordFields) {
      claveCtrl.setValidators([
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator()
      ]);
      confirmCtrl.setValidators([
        Validators.required,
        this.matchPasswordValidator('claveUsrio')
      ]);
    } else {
      claveCtrl.clearValidators();
      confirmCtrl.clearValidators();
      claveCtrl.setValue('');
      confirmCtrl.setValue('');
    }
    claveCtrl.updateValueAndValidity();
    confirmCtrl.updateValueAndValidity();
  }

  private passwordStrengthValidator(): ValidatorFn {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return pattern.test(control.value) ? null : { weakPassword: true };
    };
  }

  private passwordConditionalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.showPasswordFields || !control.value) {
        return null;
      }
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
      return pattern.test(control.value) ? null : { weakPassword: true };
    };
  }

  private matchPasswordValidator(passwordKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.form) {
        return null;
      }
      const pw = this.form.get(passwordKey)?.value;
      const cpw = control.value;
      if (this.showPasswordFields && pw && cpw && pw !== cpw) {
        return { mismatch: true };
      }
      return null;
    };
  }

  get f() {
    return this.form.controls;
  }

  saveCuenta(): void {
    this.form.markAllAsTouched();

    if (this.showPasswordFields) {
      if (this.f['claveUsrio'].invalid || this.f['confirmPassword'].invalid) {
        return;
      }
    }
    if (this.f['correoUsuario'].invalid) {
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    const usuarioActual: any = JSON.parse(localStorage.getItem('auth_user') || '{}');

    const usuarioPayload: Usuario = {
      id:             usuarioActual.id,
      correoUsuario:  this.f['correoUsuario'].value.trim().toLowerCase(),
      loginUsrio:     this.f['correoUsuario'].value.trim().toLowerCase(),
      claveUsrio:     this.showPasswordFields ? this.f['claveUsrio'].value : undefined,
      fchaUltmaClave: this.showPasswordFields ? new Date().toISOString() : usuarioActual.fchaUltmaClave,
      idTipoUsuario:  usuarioActual.idTipoUsuario,
      estado:         usuarioActual.estado,
      intentos:       usuarioActual.intentos
    };

    this.http.post<Usuario>(`${this.USUARIO_API}/saveUsuario`, usuarioPayload).subscribe({
      next: (usuarioRes) => {
        localStorage.setItem('auth_user', JSON.stringify(usuarioRes));
        if (this.showPasswordFields) {
          this.notify.success('Contraseña actualizada', 'Tu contraseña se guardó correctamente.');
        } else {
          this.notify.success('Cuenta actualizada', 'Los datos de tu cuenta se guardaron correctamente.');
        }
        this.loading = false;
        if (this.showPasswordFields) {
          this.togglePasswordFields();
        }
      },
      error: (err) => {
        console.error('Error al actualizar cuenta', err);
        const mensaje = (err.error && typeof err.error === 'string')
          ? err.error
          : 'Ocurrió un error al actualizar tu cuenta.';
        this.errorMsg = mensaje;
        this.notify.error('Error', mensaje);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/usuario']);
  }
}
