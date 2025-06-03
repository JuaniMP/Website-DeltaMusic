import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private apiUrl = 'http://localhost:8181/reporte/estadisticas'; // Cambia el host/puerto si tu backend es diferente

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

  // Si algún día tienes un endpoint para datos estadísticos tipo JSON, puedes agregar:
  // getDashboardStats(): Observable<any> {
  //   return this.http.get('URL_DEL_ENDPOINT_ESTADISTICAS');
  // }
}
