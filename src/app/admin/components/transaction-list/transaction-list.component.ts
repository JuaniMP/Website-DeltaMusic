// src/app/admin/components/transaction-list/transaction-list.component.ts
import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { RouterModule }         from '@angular/router';
import { TransactionService }   from '../../services/transaction.service';
import { Transaction }          from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];

  constructor(private svc: TransactionService) {}

  ngOnInit(): void {
  this.svc.getAll().subscribe({
    next: data => {
      // Ordena descendente por fecha/hora (de más reciente a más antigua)
      this.transactions = data.sort(
        (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

    },
    error: err => console.error('Error cargando transacciones', err)
  });
}

}
