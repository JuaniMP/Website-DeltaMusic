// src/app/admin/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment'; // Ajusta la ruta según la estructura

@Injectable({ providedIn: 'root' })
export class TransactionService {
  // Usa la URL base dinámica desde environment
  private baseUrl = environment.API_URL + '/transaccion';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/getAll`);
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/findRecord/${id}`);
  }
}
