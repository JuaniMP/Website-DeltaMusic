// src/app/usuario/producto/producto.model.ts
export interface Producto {
  id: number;
  descripcion: string;
  precioVentaActual: number;
  fotoProducto: string;
  tipo: 'vinilo' | 'cd';
}
