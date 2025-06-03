// src/app/usuario/components/edit-profile/edit-profile.component.ts

import { Component, OnInit } from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import {
  RouterModule,
  Router
} from '@angular/router';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import {
  NotificationService
} from '../../shared/notification.service';

interface Usuario {
  id?: number;
  correoUsuario: string;
  loginUsrio?: string;
  claveUsrio?: string;       // Nueva contraseña (solo si se modifica)
  idTipoUsuario?: string;    // Ej: "2"
  estado?: number;           // Ej: 1
  intentos?: number;         // Ej: 0
  fchaUltmaClave?: string;   // ISO date
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

  private readonly USUARIO_API = 'http://localhost:8181/usuario';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notify: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      // —— Campos de USUARIO
      correoUsuario:   ['', [Validators.required, Validators.email]],
      claveUsrio:      ['', [ this.passwordConditionalValidator() ]],
      confirmPassword: ['', [ this.matchPasswordValidator('claveUsrio') ]]
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

    // 1) Pre‐llenar el campo "correoUsuario"
    this.form.patchValue({
      correoUsuario: usuarioActual.correoUsuario || ''
    });
    this.loading = false;
  }

  /**
   * Alterna la visibilidad de los campos de contraseña.
   * Si se muestran, agregamos validaciones; si se ocultan, las quitamos y limpiamos valores.
   */
  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;

    const claveCtrl   = this.form.get('claveUsrio')!;
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

  /** Validador de fuerza para contraseña (6–8 caracteres, 1 mayúscula, 1 minúscula, 1 dígito). */
  private passwordStrengthValidator(): ValidatorFn {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return pattern.test(control.value) ? null : { weakPassword: true };
    };
  }

  /** Validador condicional: si no se muestra el campo, no marca error; si se muestra y tiene valor, aplica fuerza. */
  private passwordConditionalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.showPasswordFields || !control.value) {
        return null;
      }
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
      return pattern.test(control.value) ? null : { weakPassword: true };
    };
  }

  /** Validador de “confirmPassword”: verifica que coincida con “claveUsrio” únicamente si se están mostrando ambos campos. */
  private matchPasswordValidator(passwordKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.form) {
        return null;
      }
      const pw  = this.form.get(passwordKey)?.value;
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

  /**
   * ── Método para “Guardar Cuenta” ──
   *   ■ Actualiza únicamente la tabla `usuario`.
   *   ■ El payload incluye TODOS los campos no nulos de esa tabla:
   *      - id
   *      - correoUsuario, loginUsrio
   *      - claveUsrio (y fchaUltmaClave = fecha actual si se cambió)
   *      - idTipoUsuario, estado, intentos (rescatados de localStorage)
   */
  saveCuenta(): void {
    // 1) Marcamos validación sobre campos de Usuario
    this.form.markAllAsTouched();

    // 2) Si el usuario solicitó cambio de contraseña, forzamos validación de esos campos
    if (this.showPasswordFields) {
      if (this.f['claveUsrio'].invalid || this.f['confirmPassword'].invalid) {
        return;
      }
    }
    // 3) Validamos siempre correoUsuario
    if (this.f['correoUsuario'].invalid) {
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    // 4) Recuperamos el objeto Usuario completo desde localStorage
    const usuarioActual: any = JSON.parse(localStorage.getItem('auth_user') || '{}');

    // 5) Armamos el payload EXACTO para /usuario/saveUsuario
    const usuarioPayload: Usuario = {
      id:             usuarioActual.id,
      correoUsuario:  this.f['correoUsuario'].value.trim().toLowerCase(),
      loginUsrio:     this.f['correoUsuario'].value.trim().toLowerCase(),

      // Si el usuario decidió cambiar contraseña, enviamos la nueva y actualizamos fecha
      claveUsrio:     this.showPasswordFields ? this.f['claveUsrio'].value : undefined,
      fchaUltmaClave: this.showPasswordFields
                        ? new Date().toISOString()
                        : usuarioActual.fchaUltmaClave,

      // —— Campos obligatorios de la tabla:
      idTipoUsuario:  usuarioActual.idTipoUsuario,
      estado:         usuarioActual.estado,
      intentos:       usuarioActual.intentos
    };

    this.http.post<Usuario>(`${this.USUARIO_API}/saveUsuario`, usuarioPayload).subscribe({
      next: (usuarioRes) => {
        // 6) Actualizamos localStorage con la respuesta (que ya contiene todos los campos correctos)
        localStorage.setItem('auth_user', JSON.stringify(usuarioRes));

        // 7) Notificación adecuada
        if (this.showPasswordFields) {
          this.notify.success('Contraseña actualizada', 'Tu contraseña se guardó correctamente.');
        } else {
          this.notify.success('Cuenta actualizada', 'Los datos de tu cuenta se guardaron correctamente.');
        }

        this.loading = false;

        // 8) Si el usuario cambió contraseña, ocultamos nuevamente los campos
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
