import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NotificationService } from '../../../shared/notification.service'; // Ajusta la ruta si es diferente

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
    private notify: NotificationService, // <--- AÑADE EL SERVICIO
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data: User[]) => this.users = data,
      error: (err: any) => console.error('Error cargando usuarios', err)
    });
  }

  /** Redirige al formulario de edición */
  editUser(user: User): void {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  /** Activa o desactiva el usuario cambiando el estado entre 1 y 0 */
  toggleActive(user: User): void {
    const newEstado = user.estado === 1 ? 0 : 1;
    const payload: User = { ...user, estado: newEstado };
    this.userService.update(user.id, payload).subscribe({
      next: () => {
        this.loadUsers();
        if (newEstado === 0) {
          this.notify.success('Usuario desactivado', `El usuario ${user.correoUsuario} ha sido desactivado correctamente.`);
        } else {
          this.notify.success('Usuario activado', `El usuario ${user.correoUsuario} ha sido activado correctamente.`);
        }
      },
      error: err => {
        this.notify.error('Error', 'No se pudo cambiar el estado del usuario.');
        console.error('Error cambiando estado', err);
      }
    });
  }
}
