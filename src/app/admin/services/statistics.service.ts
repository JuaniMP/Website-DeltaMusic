import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajusta la ruta relativa según dónde esté el servicio

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  
  // Base URL dinámica usando la variable de entorno y concatenando la ruta específica
  private apiUrl = environment.API_URL + '/reporte/estadisticas';

  constructor(private http: HttpClient) {}

  /** Descarga el reporte en PDF */
  downloadPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, {
      responseType: 'blob'
    });
  }

  /** Descarga el reporte en Excel */
  downloadExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel`, {
      responseType: 'blob'
    });
  }

  // En caso de que agregues futuros endpoints JSON para estadísticas
  // getDashboardStats(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/dashboard`);
  // }
}
