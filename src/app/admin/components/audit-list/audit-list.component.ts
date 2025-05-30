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
        this.audits = data;
        this.filtered = data;
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
  }
}
