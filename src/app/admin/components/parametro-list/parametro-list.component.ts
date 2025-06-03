import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParametroService, Parametro } from '../../services/parametro.service';

@Component({
  selector: 'app-parametro-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass,CommonModule],
  templateUrl: './parametro-list.component.html',
  styleUrls: ['./parametro-list.component.css']
})
export class ParametroListComponent implements OnInit {
  parametros: Parametro[] = [];

  constructor(
    private service: ParametroService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParametros();
  }

  loadParametros() {
    this.service.getAll().subscribe({
      next: data => this.parametros = data,
      error: err => console.error('Error cargando parámetros', err)
    });
  }

  deleteParametro(id?: number) {
    if (id == null) return;
    if (!confirm('¿Eliminar este parámetro?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadParametros(),
      error: err => alert('No se pudo eliminar')
    });
  }

  irCrearParametro() {
    this.router.navigate(['/admin/parametros/new']);
  }
}
