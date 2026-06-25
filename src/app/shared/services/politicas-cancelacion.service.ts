import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type PoliticaCancelacion = {
  id: string;
  id_cine: string;
  nombre: string;
  activa: boolean;
  created_at: string;
  reglas?: ReglaPolitica[];
};

export type ReglaPolitica = {
  id: string;
  id_politica: string;
  horas_antes_minimo: number;
  horas_antes_maximo: number | null;
  porcentaje_reembolso: number;
};

export type ReglaPoliticaInput = {
  horas_antes_minimo: number;
  horas_antes_maximo: number | null;
  porcentaje_reembolso: number;
};

export type CrearPoliticaInput = {
  id_cine: string;
  nombre: string;
  reglas: ReglaPoliticaInput[];
};

export type EditarPoliticaInput = {
  nombre?: string;
  reglas?: ReglaPoliticaInput[];
};

type BackendRegla = {
  id: string | number;
  horas_antes_minimo: number;
  horas_antes_maximo: number | null;
  porcentaje_reembolso: number | string;
};

type BackendPolitica = {
  id: string | number;
  id_cine: string | number;
  nombre: string;
  activa: boolean;
  created_at?: string;
  reglas?: BackendRegla[];
};

type BackendPaginatedPoliticas = {
  data: BackendPolitica[];
  total: number;
  page: number;
  limit: number;
};

function mapBackendRegla(r: BackendRegla, idPolitica: string): ReglaPolitica {
  return {
    id: toStr(r.id),
    id_politica: idPolitica,
    horas_antes_minimo: r.horas_antes_minimo,
    horas_antes_maximo: r.horas_antes_maximo,
    porcentaje_reembolso:
      typeof r.porcentaje_reembolso === 'number'
        ? r.porcentaje_reembolso
        : Number(r.porcentaje_reembolso),
  };
}

function mapBackendPolitica(p: BackendPolitica): PoliticaCancelacion {
  const id = toStr(p.id);
  return {
    id,
    id_cine: toStr(p.id_cine),
    nombre: p.nombre,
    activa: p.activa,
    created_at: p.created_at ?? '',
    reglas: p.reglas ? p.reglas.map((r) => mapBackendRegla(r, id)) : undefined,
  };
}

// El bulk-replace endpoint (PATCH /admin/politicas-cancelacion/:id/reglas)
// requiere `horas_antes_maximo` no-nulo; mapeamos null → 0 para satisfacer el DTO.
function reglaToReplaceInputDto(
  r: ReglaPoliticaInput,
): components['schemas']['ReglaPoliticaInputDto'] {
  return {
    horas_antes_minimo: r.horas_antes_minimo,
    horas_antes_maximo: r.horas_antes_maximo ?? 0,
    porcentaje_reembolso: r.porcentaje_reembolso,
  };
}

function reglaToCreateDto(
  r: ReglaPoliticaInput,
): components['schemas']['ReglaPoliticaDto'] {
  return {
    horas_antes_minimo: r.horas_antes_minimo,
    horas_antes_maximo: r.horas_antes_maximo,
    porcentaje_reembolso: r.porcentaje_reembolso,
  };
}

@Injectable({ providedIn: 'root' })
export class PoliticasCancelacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/politicas-cancelacion`;
  private readonly adminBase = `${API_URL}/admin/politicas-cancelacion`;

  list(): Observable<PoliticaCancelacion[]> {
    const params = new HttpParams().set('page', 1).set('limit', 1000);
    return this.http
      .get<BackendPaginatedPoliticas>(this.base, { params })
      .pipe(map((res) => res.data.map(mapBackendPolitica)));
  }

  getById(id: string): Observable<PoliticaCancelacion> {
    return this.http
      .get<BackendPolitica>(`${this.base}/${id}`)
      .pipe(map(mapBackendPolitica));
  }

  listByCine(idCine: string): Observable<PoliticaCancelacion[]> {
    return this.http
      .get<BackendPolitica[]>(`${this.adminBase}/cine/${idCine}`)
      .pipe(map((arr) => arr.map(mapBackendPolitica)));
  }

  listReglas(idPolitica: string): Observable<ReglaPolitica[]> {
    return this.http
      .get<BackendRegla[]>(`${this.adminBase}/${idPolitica}/reglas`)
      .pipe(map((arr) => arr.map((r) => mapBackendRegla(r, idPolitica))));
  }

  saveReglas(
    idPolitica: string,
    reglas: ReglaPoliticaInput[],
  ): Observable<ReglaPolitica[]> {
    const body: components['schemas']['ReplaceReglasDto'] = {
      reglas: reglas.map(reglaToReplaceInputDto),
    };
    return this.http
      .patch<BackendRegla[]>(`${this.adminBase}/${idPolitica}/reglas`, body)
      .pipe(map((arr) => arr.map((r) => mapBackendRegla(r, idPolitica))));
  }

  setActiva(id: string, activa: boolean): Observable<PoliticaCancelacion> {
    const body: components['schemas']['SetActivaDto'] = { activa };
    return this.http
      .patch<BackendPolitica>(`${this.adminBase}/${id}/activa`, body)
      .pipe(map(mapBackendPolitica));
  }

  create(input: CrearPoliticaInput): Observable<PoliticaCancelacion> {
    const body: components['schemas']['CreatePoliticaCancelacionDto'] = {
      id_cine: input.id_cine,
      nombre: input.nombre,
      reglas: input.reglas.map(reglaToCreateDto),
    };
    return this.http
      .post<BackendPolitica>(this.base, body)
      .pipe(map(mapBackendPolitica));
  }

  update(id: string, input: EditarPoliticaInput): Observable<PoliticaCancelacion> {
    const body: components['schemas']['UpdatePoliticasCancelacionDto'] = {
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.reglas !== undefined
        ? { reglas: input.reglas.map(reglaToCreateDto) }
        : {}),
    };
    return this.http
      .patch<BackendPolitica>(`${this.base}/${id}`, body)
      .pipe(map(mapBackendPolitica));
  }

  getPublicByCine(
    idCine: string,
    onlyActiva = true,
  ): Observable<PoliticaCancelacion[]> {
    return this.list().pipe(
      map((arr) =>
        arr.filter(
          (p) => p.id_cine === idCine && (!onlyActiva || p.activa),
        ),
      ),
    );
  }
}
