import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type Sala = {
  id: string;
  nombre: string;
  filas?: number;
  columnas?: number;
  id_cine?: string;
};

export type Cine = {
  id: string;
  nombre: string;
  direccion: string | null;
  id_ciudad: string;
  ciudad_nombre?: string;
  activo: boolean;
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

export type CrearCineInput = components['schemas']['CreateCineDto'];
export type EditarCineInput = components['schemas']['UpdateCineDto'];

export type CrearSalaInput = {
  nombre: string;
  filas: number;
  columnas: number;
  id_cine?: string;
};

export type EditarSalaInput = Partial<CrearSalaInput>;

type BackendCineListItem = {
  id: string | number;
  nombre: string;
  direccion: string | null;
  id_ciudad: string | number;
  activo?: boolean;
  salas?: Array<{ id: string | number; nombre: string }>;
  fecha_creacion?: string | Date;
  created_at?: string | Date;
};

type BackendCineRaw = {
  id: string | number;
  nombre: string;
  direccion: string | null;
  id_ciudad: string | number;
  activo?: boolean;
  created_at?: string | Date;
};

function mapListItem(c: BackendCineListItem): Cine {
  const rawDate = c.fecha_creacion ?? c.created_at;
  return {
    id: toStr(c.id),
    nombre: c.nombre,
    direccion: c.direccion ?? null,
    id_ciudad: toStr(c.id_ciudad),
    activo: c.activo ?? true,
    salas: (c.salas ?? []).map((s) => ({
      id: toStr(s.id),
      nombre: s.nombre,
    })),
    created_at:
      rawDate instanceof Date
        ? rawDate.toISOString()
        : (rawDate as string | undefined) ?? new Date(0).toISOString(),
  };
}

function mapRaw(c: BackendCineRaw): Cine {
  return {
    id: toStr(c.id),
    nombre: c.nombre,
    direccion: c.direccion ?? null,
    id_ciudad: toStr(c.id_ciudad),
    activo: c.activo ?? true,
    salas: [],
    created_at:
      c.created_at instanceof Date
        ? c.created_at.toISOString()
        : (c.created_at as string | undefined) ?? new Date(0).toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class CinesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/cine`;

  list(q: ListCinesQuery = {}): Observable<CinesPage> {
    let params = new HttpParams();
    if (q.page) params = params.set('page', String(q.page));
    if (q.limit) params = params.set('limit', String(q.limit));
    if (q.name && q.name.trim()) params = params.set('name', q.name.trim());
    if (q.id_ciudad != null && q.id_ciudad !== '') {
      params = params.set('id_ciudad', toStr(q.id_ciudad));
    }
    return this.http
      .get<{ data: BackendCineListItem[]; total: number; page: number; limit: number }>(
        this.base,
        { params },
      )
      .pipe(
        map((res) => ({
          data: res.data.map(mapListItem),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  getById(id: string): Observable<Cine> {
    return this.http
      .get<BackendCineListItem>(`${this.base}/${id}`)
      .pipe(map(mapListItem));
  }

  create(input: CrearCineInput): Observable<Cine> {
    return this.http
      .post<{ id: string | number }>(this.base, input)
      .pipe(switchMap((res) => this.getById(toStr(res.id))));
  }

  update(id: string, input: EditarCineInput): Observable<Cine> {
    return this.http
      .patch<BackendCineRaw>(`${this.base}/${id}`, input)
      .pipe(map(mapRaw));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  setActivo(id: string, activo: boolean): Observable<Cine> {
    return this.http
      .patch<BackendCineRaw>(`${this.base}/${id}/activo`, { activo })
      .pipe(map(mapRaw));
  }

  /** @deprecated Unit 4 will replace this stub with a real HTTP call */
  addSala(_idCine: string, _input: CrearSalaInput): Observable<Sala> {
    throw new Error('addSala: not yet wired — use Unit 4 plan');
  }

  /** @deprecated Unit 4 will replace this stub */
  getSala(_idCine: string, _idSala: string): Observable<Sala> {
    throw new Error('getSala: not yet wired — use Unit 4 plan');
  }

  /** @deprecated Unit 4 will replace this stub */
  updateSala(_idCine: string, _idSala: string, _input: EditarSalaInput): Observable<Sala> {
    throw new Error('updateSala: not yet wired — use Unit 4 plan');
  }
}
