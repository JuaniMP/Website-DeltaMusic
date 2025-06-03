import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MethodPaymentService, MetodoPago } from '../../services/method-payment.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-method-payment',
  templateUrl: './create-method-payment.component.html',
  styleUrls: ['./create-method-payment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
})
export class CreateMethodPaymentComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  // Solo descripcion y estado (nunca nombre)
  metodo: Partial<MetodoPago> = { descripcion: '', estado: 1 };
  mensaje = '';

  constructor(private service: MethodPaymentService) {}

  guardarMetodo() {
    if (!this.metodo.descripcion || this.metodo.estado == null) {
      this.mensaje = 'Completa todos los campos.';
      return;
    }
    this.service.save(this.metodo as MetodoPago).subscribe({
      next: () => {
        this.mensaje = 'Método guardado correctamente';
        setTimeout(() => {
          this.cerrar();
          this.saved.emit();
        }, 800);
      },
      error: () => this.mensaje = 'Error al guardar el método'
    });
  }

  cerrar() {
    this.show = false;
    this.closed.emit(true);
    this.mensaje = '';
    this.metodo = { descripcion: '', estado: 1 };
  }
}
