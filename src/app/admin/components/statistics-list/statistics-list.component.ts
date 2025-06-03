import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ProductoService } from '../../services/producto.service';
import { TransactionService } from '../../services/transaction.service';
import { MethodPaymentService } from '../../services/method-payment.service';
import { ParametroService } from '../../services/parametro.service';
import { AuditoriaService } from '../../services/auditoria.service';
import { StatisticsService } from '../../services/statistics.service';
import { FormsModule } from '@angular/forms';
import {
  NgIf,
  NgForOf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault
} from '@angular/common';

import { NgChartsModule } from 'ng2-charts'; // <-- IMPORTA AQUÍ

@Component({
  selector: 'app-statistics-list',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgChartsModule, // <-- AGREGA AQUÍ
  ],
  templateUrl: './statistics-list.component.html',
  styleUrls: ['./statistics-list.component.css']
})
export class StatisticsListComponent implements OnInit {
  statOptions = [
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'productos', label: 'Productos' },
    { key: 'transacciones', label: 'Transacciones' },
    { key: 'metodosPago', label: 'Métodos de pago' },
    { key: 'parametros', label: 'Parámetros' },
    { key: 'auditoria', label: 'Auditoría' }
  ];
  selectedStat = 'usuarios';
  statResult: any = null;

  // Agrega tus propiedades de gráfico aquí
  chartData: any = null;
  chartLabels: string[] = [];
  chartType: any = 'pie';
  chartOptions: any = {
    responsive: true,
    plugins: { legend: { display: true, position: 'bottom' } }
  };

  constructor(
    private userService: UserService,
    private productoService: ProductoService,
    private transactionService: TransactionService,
    private methodPaymentService: MethodPaymentService,
    private parametroService: ParametroService,
    private auditoriaService: AuditoriaService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.loadSelectedStat();
  }

  loadSelectedStat() {
    this.statResult = null;
    this.chartData = null;
    switch (this.selectedStat) {
      case 'usuarios':
        this.userService.getAll().subscribe(users => {
          const total = users.length;
          const totalActivos = users.filter(u => u.estado === 1).length;
          const totalInactivos = total - totalActivos;
          this.statResult = { total, totalActivos, totalInactivos };
          this.chartLabels = ['Activos', 'Inactivos'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [totalActivos, totalInactivos] }]
          };
          this.chartType = 'pie';
        });
        break;
      case 'productos':
        this.productoService.getAll().subscribe(prods => {
          const total = prods.length;
          const activos = prods.filter(p => p.estado === 1).length;
          const inactivos = total - activos;
          this.statResult = { total, activos, inactivos };
          this.chartLabels = ['Activos', 'Inactivos'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [activos, inactivos], label: 'Productos' }]
          };
          this.chartType = 'bar';
        });
        break;
      case 'transacciones':
        this.transactionService.getAll().subscribe(txs => {
          const total = txs.length;
          const activas = txs.filter(t => t.estado === 1).length;
          const anuladas = total - activas;
          this.statResult = { total, activas, anuladas };
          this.chartLabels = ['Activas', 'Anuladas'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [activas, anuladas], label: 'Transacciones' }]
          };
          this.chartType = 'bar';
        });
        break;
      case 'metodosPago':
        this.methodPaymentService.getAll().subscribe(mps => {
          const total = mps.length;
          const activos = mps.filter(m => m.estado === 1).length;
          this.statResult = { total, activos };
          this.chartLabels = ['Activos', 'Total'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [activos, total], label: 'Métodos de Pago' }]
          };
          this.chartType = 'bar';
        });
        break;
      case 'parametros':
        this.parametroService.getAll().subscribe(params => {
          const total = params.length;
          const activos = params.filter(p => p.estado === 1).length;
          this.statResult = { total, activos };
          this.chartLabels = ['Activos', 'Total'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [activos, total], label: 'Parámetros' }]
          };
          this.chartType = 'bar';
        });
        break;
      case 'auditoria':
        this.auditoriaService.getAll().subscribe(audits => {
          const total = audits.length;
          this.statResult = { total };
          this.chartLabels = ['Registros'];
          this.chartData = {
            labels: this.chartLabels,
            datasets: [{ data: [total], label: 'Auditoría' }]
          };
          this.chartType = 'bar';
        });
        break;
      default:
        this.statResult = null;
        this.chartData = null;
    }
  }

  downloadPdf() {
    this.statisticsService.downloadPdf().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estadisticas.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadExcel() {
    this.statisticsService.downloadExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estadisticas.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
