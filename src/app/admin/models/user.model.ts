// src/app/admin/models/user.model.ts
export interface User {
  id: number;
  nombre?: string;
  apellidos?: string;
  correoUsuario: string;
  loginUsrio?: string;
  estado: number;            // antes era number, ahora booleano
  intentos?: number;
  fchaUltmaClave?: string;
  idTipoUsuario?: string;
  comprasCount?: number;
}
