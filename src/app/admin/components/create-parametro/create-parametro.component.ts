import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametroService } from '../../services/parametro.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-parametro',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './create-parametro.component.html',
  styleUrls: ['./create-parametro.component.css'],
})
export class CreateParametroComponent {
  // Los mismos nombres que la BD y el backend esperan
  parametro: any = {
    descripcion: '',
    valor_numero: null,
    valor_texto: '',
    fecha_inicial: '',
    fecha_final: '',
    estado: 1
  };
  mensaje = '';

  constructor(
    private parametroService: ParametroService,
    private router: Router
  ) {}

  guardarParametro() {
    // Validación simple
    if (!this.parametro.descripcion || this.parametro.estado === null) {
      this.mensaje = 'Completa todos los campos obligatorios';
      return;
    }
    this.parametroService.save(this.parametro).subscribe({
      next: () => {
        this.mensaje = 'Parámetro guardado correctamente';
        setTimeout(() => {
          this.router.navigate(['/admin/parametros']); // Regresa al listado
        }, 900);
      },
      error: () => this.mensaje = 'Error al guardar el parámetro'
    });
  }
}
