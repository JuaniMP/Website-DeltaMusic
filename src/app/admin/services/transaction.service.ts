// src/app/admin/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = 'http://localhost:8181/transaccion';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/getAll`);
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/findRecord/${id}`);
  }
}
