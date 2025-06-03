import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsListComponent } from '../components/statistics-list/statistics-list.component';

@NgModule({
  declarations: [
    // Si tu componente NO es standalone, va aquí:
    // StatisticsListComponent
  ],
  imports: [
    CommonModule,
    // Importa aquí más módulos si usas gráficos, ng2-charts, etc.
  ],
  exports: [
    // Si NO es standalone:
    // StatisticsListComponent
  ]
})
export class StatisticsModule { }
