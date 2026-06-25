import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type Ciudad = {
  id: string;
  nombre: string;
  created_at: string;
};

export type CrearCiudadInput = components['schemas']['CreateCiudadesDto'];

export type EditarCiudadInput = {
  nombre?: string;
};

type BackendCiudad = {
  id: string | number;
  nombre: string;
  created_at: string;
};

function mapBackendCiudad(c: BackendCiudad): Ciudad {
  return {
    id: toStr(c.id),
    nombre: c.nombre,
    created_at: c.created_at,
  };
}

@Injectable({ providedIn: 'root' })
export class CiudadesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/ciudades`;

  list(): Observable<Ciudad[]> {
    return this.http
      .get<BackendCiudad[]>(this.base)
      .pipe(map((arr) => arr.map(mapBackendCiudad)));
  }

  create(input: CrearCiudadInput): Observable<Ciudad> {
    return this.http
      .post<BackendCiudad>(this.base, input)
      .pipe(map(mapBackendCiudad));
  }

  update(id: string | number, input: EditarCiudadInput): Observable<Ciudad> {
    return this.http
      .patch<BackendCiudad>(`${this.base}/${id}`, input)
      .pipe(map(mapBackendCiudad));
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
