// src/app/admin/components/create-user/create-user.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../../shared/notification.service'; // ajusta ruta
import { User } from '../../models/user.model';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  userId?: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notify: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre:        ['', Validators.required],
      apellidos:     ['', Validators.required],
      correoUsuario: ['', [Validators.required, Validators.email]],
      loginUsrio:    ['', Validators.required],
      idTipoUsuario: ['U', Validators.required], // U=usuario, A=admin
      estado:        [true]                       // true=activo, false=inactivo
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.userId = Number(idParam);
      this.notify.info('Cargando usuario...');
      this.userService.getById(this.userId).subscribe({
        next: (user) => {
          // Asignar los valores al formulario
          this.form.patchValue({
            nombre:        user.nombre,
            apellidos:     user.apellidos,
            correoUsuario: user.correoUsuario,
            loginUsrio:    user.loginUsrio,
            idTipoUsuario: user.idTipoUsuario,
            estado:        !!user.estado  // convertir a booleano si es necesario
          });
        },
        error: err => {
          this.notify.error('Error', 'No se pudo cargar el usuario.');
          this.router.navigate(['/admin/users']);
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value as any;
    const payload: User = {
      ...raw,
      estado: raw.estado ? 1 : 0  // convertimos a byte o booleano si lo requiere el backend
    };

    if (this.isEdit && this.userId) {
      // Actualizar usuario existente
      this.notify.info('Actualizando usuario…');
      this.userService.update(this.userId, { ...payload, id: this.userId }).subscribe({
        next: () => {
          this.notify.success('¡Listo!', 'El usuario ha sido actualizado correctamente.');
          this.router.navigate(['/admin/users']);
        },
        error: err => {
          console.error(err);
          this.notify.error('Error', 'No se pudo actualizar el usuario. Intenta de nuevo.');
        }
      });
    } else {
      // Crear nuevo usuario
      this.notify.info('Creando usuario…');
      this.userService.save(payload).subscribe({
        next: () => {
          this.notify.success('¡Listo!', 'El usuario ha sido creado correctamente.');
          this.router.navigate(['/admin/users']);
        },
        error: err => {
          console.error(err);
          this.notify.error('Error', 'No se pudo crear el usuario. Intenta de nuevo.');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }
}
