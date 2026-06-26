import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type TipoAsiento = {
  id: string;
  nombre: string;
  color?: string | null;
  salas_usando?: number;
  asientos_total?: number;
};

export type CrearTipoAsientoInput = components['schemas']['CreateTipoAsientoDto'];
export type EditarTipoAsientoInput = Partial<CrearTipoAsientoInput>;

type BackendTipoAsiento = {
  id: string | number;
  nombre: string;
  color?: string | null;
  salas_usando?: number;
  asientos_total?: number;
};

function mapBackendTipoAsiento(t: BackendTipoAsiento): TipoAsiento {
  return {
    id: toStr(t.id),
    nombre: t.nombre,
    color: t.color ?? null,
    salas_usando: t.salas_usando,
    asientos_total: t.asientos_total,
  };
}

@Injectable({ providedIn: 'root' })
export class TiposAsientoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/tipos-asiento`;

  list(): Observable<TipoAsiento[]> {
    return this.http
      .get<BackendTipoAsiento[]>(this.base)
      .pipe(map((arr) => arr.map(mapBackendTipoAsiento)));
  }

  create(input: CrearTipoAsientoInput): Observable<TipoAsiento> {
    return this.http
      .post<BackendTipoAsiento>(this.base, input)
      .pipe(map(mapBackendTipoAsiento));
  }

  update(id: string, input: EditarTipoAsientoInput): Observable<TipoAsiento> {
    return this.http
      .patch<BackendTipoAsiento>(`${this.base}/${id}`, input)
      .pipe(map(mapBackendTipoAsiento));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
