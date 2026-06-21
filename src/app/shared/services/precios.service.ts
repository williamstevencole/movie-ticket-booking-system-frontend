import { Observable } from 'rxjs';

/** Una columna de la matriz: un tipo de asiento activo. */
export type PrecioTipoCol = {
  id: string;
  nombre: string;
  color: string;
};

/** Una fila de la matriz: un cine con su precio (override) por tipo. */
export type PrecioCineRow = {
  cineId: string;
  cineNombre: string;
  ciudad: string;
  /** tipoId -> precio override; null = hereda el precio "Por defecto". */
  precios: Record<string, number | null>;
};

export type PreciosMatriz = {
  tipos: PrecioTipoCol[];
  /** tipoId -> precio base; null = sin precio base definido. */
  defaults: Record<string, number | null>;
  cines: PrecioCineRow[];
};

export type GuardarMatrizInput = {
  defaults: Record<string, number | null>;
  cines: { cineId: string; precios: Record<string, number | null> }[];
};

export abstract class PreciosService {
  abstract getMatriz(): Observable<PreciosMatriz>;
  abstract guardar(input: GuardarMatrizInput): Observable<PreciosMatriz>;
}
