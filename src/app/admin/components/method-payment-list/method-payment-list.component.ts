import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MethodPaymentService, MetodoPago } from '../../services/method-payment.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-method-payment-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass,RouterModule], // <-- agrega esto
  templateUrl: './method-payment-list.component.html',
  styleUrls: ['./method-payment-list.component.css']
})
export class MethodPaymentListComponent implements OnInit {
  metodos: MetodoPago[] = [];

  constructor(private service: MethodPaymentService) {}

  ngOnInit(): void {
    this.loadMetodos();
  }

  loadMetodos() {
    this.service.getAll().subscribe({
      next: data => this.metodos = data,
      error: err => console.error('Error cargando métodos de pago', err)
    });
  }

  deleteMetodo(id?: number) {
    if (id == null) return;
    if (!confirm('¿Eliminar este método de pago?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadMetodos(),
      error: err => alert('No se pudo eliminar')
    });
  }
}
