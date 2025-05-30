// src/app/admin/models/transaction.model.ts
export interface Transaction {
  id: number;
  idCompra: number;
  fechaHora: string;
  identificacion: string;
  valorTx: number;
  idMetodoPago: number;
  idBanco: string;
  idFranquicia: string;
  numTarjeta: string;
  estado: number; // 1=activa, 0=anulada
}
