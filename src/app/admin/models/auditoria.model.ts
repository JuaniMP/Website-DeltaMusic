// src/app/admin/models/auditoria.model.ts
export interface Auditoria {
  /** ID de la auditoría */
  id: number;
  /** Nombre de la tabla sobre la que se actúa */
  tablaAccion: string;
  /** Tipo de acción: I (insert), U (update), D (delete), L (login), R (recuperación), etc. */
  accionAudtria: string;
  /** Usuario que generó la acción */
  usrioAudtria: string;
  /** Comentario detallado de la acción */
  comentarioAudtria: string;
  /** Fecha y hora de la acción (ISO 8601) */
  fchaAudtria: string;
  /** Dirección IP o identificador del cliente */
  addressAudtria: string;
}
