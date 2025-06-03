// src/app/admin/components/audit-list/audit-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { AuditoriaService }  from '../../services/auditoria.service';
import { Auditoria }         from '../../models/auditoria.model';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.css']
})
export class AuditListComponent implements OnInit {
  audits: Auditoria[] = [];
  filtered: Auditoria[] = [];
  filterText = '';

  constructor(private svc: AuditoriaService) {}

  ngOnInit(): void {
  this.svc.getAll().subscribe({
    next: data => {
      // Ordena descendente por fecha (de más reciente a más antigua)
      this.audits = data.sort((a, b) => new Date(b.fchaAudtria).getTime() - new Date(a.fchaAudtria).getTime());
      this.filtered = [...this.audits];
    },
    error: err => console.error('Error cargando auditoría', err)
  });
}


 applyFilter(): void {
  const term = this.filterText.toLowerCase();
  this.filtered = this.audits.filter(a =>
    a.usrioAudtria.toLowerCase().includes(term) ||
    a.tablaAccion.toLowerCase().includes(term) ||
    a.accionAudtria.toLowerCase().includes(term)
  );
  // El array ya viene ordenado, no hace falta volver a ordenar aquí.
}
}
