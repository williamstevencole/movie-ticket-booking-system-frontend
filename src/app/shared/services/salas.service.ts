import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type Sala = {
  id: string;
  nombre: string;
  id_cine: string;
  filas: number;
  columnas: number;
};

export type CrearSalaInput = components['schemas']['CreateSalaDto'];
export type EditarSalaInput = components['schemas']['UpdateSalaDto'];

export type SalaAsiento = {
  id: string;
  fila: string;
  columna: number;
  codigo: string;
  id_tipo_asiento: string;
  tipo: {
    id: string;
    nombre: string;
    color: string | null;
  };
};

export type AsignacionInput = {
  id_asiento: string;
  id_tipo_asiento: string;
};

export type ActualizarAsientosResultado = {
  updated: number;
  warning?: string;
};

type BackendSala = {
  id: string | number;
  nombre: string;
  id_cine: string | number;
  filas: number;
  columnas: number;
  warning?: string;
};

function mapBackendSala(s: BackendSala): Sala {
  return {
    id: toStr(s.id),
    nombre: s.nombre,
    id_cine: toStr(s.id_cine),
    filas: s.filas,
    columnas: s.columnas,
  };
}

type BackendSalaAsiento = {
  id: string | number;
  fila: string;
  columna: number;
  codigo: string;
  id_tipo_asiento: string | number;
  tipo: {
    id: string | number;
    nombre: string;
    color: string | null;
  };
};

function mapBackendSalaAsiento(a: BackendSalaAsiento): SalaAsiento {
  return {
    id: toStr(a.id),
    fila: a.fila,
    columna: a.columna,
    codigo: a.codigo,
    id_tipo_asiento: toStr(a.id_tipo_asiento),
    tipo: {
      id: toStr(a.tipo.id),
      nombre: a.tipo.nombre,
      color: a.tipo.color,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class SalasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/salas`;

  list(idCine?: string): Observable<Sala[]> {
    let params = new HttpParams();
    if (idCine != null && idCine !== '') {
      params = params.set('id_cine', String(idCine));
    }
    return this.http
      .get<BackendSala[]>(this.base, { params })
      .pipe(map((arr) => arr.map(mapBackendSala)));
  }

  getById(id: string): Observable<Sala> {
    return this.http
      .get<BackendSala>(`${this.base}/${id}`)
      .pipe(map(mapBackendSala));
  }

  create(input: CrearSalaInput): Observable<Sala> {
    return this.http
      .post<BackendSala>(this.base, input)
      .pipe(map(mapBackendSala));
  }

  update(
    id: string,
    input: EditarSalaInput,
    opts?: { force?: boolean },
  ): Observable<Sala & { warning?: string }> {
    const body = opts?.force ? { ...input, force: true } : input;
    return this.http
      .patch<BackendSala>(`${this.base}/${id}`, body)
      .pipe(
        map((res) => ({
          ...mapBackendSala(res),
          warning: res.warning,
        })),
      );
  }

  delete(id: string): Observable<{ id: number }> {
    return this.http.delete<{ id: number }>(`${this.base}/${id}`);
  }

  listAsientos(idSala: string): Observable<SalaAsiento[]> {
    return this.http
      .get<BackendSalaAsiento[]>(`${this.base}/${idSala}/asientos`)
      .pipe(map((arr) => arr.map(mapBackendSalaAsiento)));
  }

  updateAsientos(
    idSala: string,
    asignaciones: AsignacionInput[],
  ): Observable<ActualizarAsientosResultado> {
    return this.http.patch<ActualizarAsientosResultado>(
      `${this.base}/${idSala}/asientos`,
      { asignaciones },
    );
  }
}
