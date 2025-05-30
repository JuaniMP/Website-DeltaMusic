// src/app/admin/models/producto.model.ts
export interface Producto {
  id?: number;            // ahora opcional
  referencia: string;
  descripcion: string;
  precioVentaActual: number;
  existencia: number;
  estado: number;         // 1 = activo, 0 = inactivo
  costoCompra?: number;
  fotoProducto?: string;
  idCategoria?: number;
  precioVentaAnterior?: number;
  stockMaximo?: number;
  tieneIva?: number;
}
