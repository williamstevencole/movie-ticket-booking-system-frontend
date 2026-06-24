import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CINES } from '../../mocks/data/cines.mock';

export type Sala = {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
  id_cine?: string;
};

export type Cine = {
  id: string;
  nombre: string;
  direccion: string | null;
  id_ciudad: string;
  salas: Sala[];
  created_at: string;
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

export type CrearCineInput = {
  nombre: string;
  id_ciudad: string;
  direccion: string | null;
};

export type EditarCineInput = Partial<CrearCineInput>;

export type CrearSalaInput = {
  nombre: string;
  filas: number;
  columnas: number;
  id_cine?: string;
};

export type EditarSalaInput = Partial<CrearSalaInput>;

@Injectable({ providedIn: 'root' })
export class CinesService {
  list(query?: ListCinesQuery): Observable<CinesPage> {
    let rows = [...MOCK_CINES];
    if (query?.name) rows = rows.filter((c) => c.nombre.toLowerCase().includes(query.name!.toLowerCase()));
    if (query?.id_ciudad != null) rows = rows.filter((c) => c.id_ciudad === String(query.id_ciudad));
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit }).pipe(delay(120));
  }

  getById(id: string): Observable<Cine> {
    const found = MOCK_CINES.find((c) => c.id === id) ?? MOCK_CINES[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  create(input: CrearCineInput): Observable<Cine> {
    const nuevo: Cine = {
      id: `cine-${Date.now()}`,
      nombre: input.nombre,
      id_ciudad: input.id_ciudad,
      direccion: input.direccion,
      salas: [],
      created_at: new Date().toISOString(),
    };
    return of({ ...nuevo }).pipe(delay(120));
  }

  update(id: string, input: EditarCineInput): Observable<Cine> {
    const found = MOCK_CINES.find((c) => c.id === id) ?? MOCK_CINES[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  /** POST /api/salas — backend sala creation is flat (not nested under cine) */
  addSala(idCine: string, input: CrearSalaInput): Observable<Sala> {
    const sala: Sala = {
      id: `sala-${Date.now()}`,
      nombre: input.nombre,
      filas: input.filas,
      columnas: input.columnas,
      id_cine: idCine,
    };
    return of({ ...sala }).pipe(delay(120));
  }

  /** GET /api/salas/:id */
  getSala(_idCine: string, idSala: string): Observable<Sala> {
    const cine = MOCK_CINES.find((c) => c.id === _idCine) ?? MOCK_CINES[0]!;
    const sala = cine.salas.find((s) => s.id === idSala) ?? cine.salas[0]!;
    return of({ ...sala, id_cine: _idCine }).pipe(delay(120));
  }

  /** PUT /api/salas/:id */
  updateSala(_idCine: string, idSala: string, input: EditarSalaInput): Observable<Sala> {
    const cine = MOCK_CINES.find((c) => c.id === _idCine) ?? MOCK_CINES[0]!;
    const sala = cine.salas.find((s) => s.id === idSala) ?? cine.salas[0]!;
    return of({ ...sala, ...input, id_cine: _idCine }).pipe(delay(120));
  }
}
