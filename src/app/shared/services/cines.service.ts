import { Observable } from 'rxjs';

// ─── tipos ────────────────────────────────────────────────────
export type Sala = {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
};

export type Cine = {
  id: string;
  nombre: string;
  direccion: string | null;
  id_ciudad: string;
  salas: Sala[];
  fecha_creacion: string;
};

export type CinesPage = {
  data: Cine[];
  total: number;
  page: number;
  limit: number;
};

export type ListCinesQuery = {
  name?: string;
  page?: number;
  limit?: number;
  id_ciudad?: number | string;
};

/** Ver `ciudades.service.ts` para la nota de arquitectura. */
export abstract class CinesService {
  abstract list(query?: ListCinesQuery): Observable<CinesPage>;
  abstract getById(id: string): Observable<Cine>;
}
