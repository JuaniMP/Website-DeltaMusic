import { Component }                from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule }      from '@angular/forms';
import { RouterModule }             from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule   // ← necesario para usar routerLink en el template
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre:    ['', Validators.required],
      apellidos: ['', Validators.required],
      correo:    ['', [Validators.required, Validators.email]]
      // ya no hay cedula ni nacimiento
    });
  }

  submit() {
    if (this.form.valid) {
      console.log('Formulario enviado:', this.form.value);
      // Aquí podrías enviar al servidor y luego redirigir:
      // this.router.navigate(['/login']);
    } else {
      console.log('Formulario inválido');
      this.form.markAllAsTouched();
    }
  }
}
