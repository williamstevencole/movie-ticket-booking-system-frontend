import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';
import { extractMessage } from '../utils/http-errors';

export type CuponTipo = 'porcentaje' | 'monto' | 'monto_fijo';

export type Cupon = {
  id: string;
  codigo: string;
  tipo: CuponTipo | string;
  valor: number | string;
  fecha_expiracion: string;
  usos_maximos: number | null;
  usos_actuales: number;
  activo: boolean;
  created_at: string;
  monto_descontado?: number;
  titulo?: string;
  descripcion?: string;
};

export type ValidarCuponResponse = {
  valido: boolean;
  cupon?: Cupon;
  mensaje?: string;
};

export type CrearCuponInput = {
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  fecha_expiracion: string;
  usos_maximos: number | null;
};

export type EditarCuponInput = Partial<CrearCuponInput>;

type BackendCupon = {
  id: string | number;
  codigo: string;
  tipo: string;
  valor: string | number;
  fecha_expiracion: string;
  usos_maximos: number | null;
  usos_actuales: number;
  titulo?: string | null;
  descripcion?: string | null;
  activo: boolean;
  created_at: string;
};

type BackendValidarOk = {
  valido: true;
  codigo: string;
  tipo: string;
  valor: string | number;
  fecha_expiracion: string;
};

type BackendActivoSlim = {
  id: string | number;
  codigo: string;
  activo: boolean;
};

function mapBackendCupon(c: BackendCupon): Cupon {
  return {
    id: toStr(c.id),
    codigo: c.codigo,
    tipo: c.tipo,
    valor: typeof c.valor === 'number' ? c.valor : Number(c.valor),
    fecha_expiracion: c.fecha_expiracion,
    usos_maximos: c.usos_maximos,
    usos_actuales: c.usos_actuales,
    activo: c.activo,
    created_at: c.created_at,
    titulo: c.titulo ?? '',
    descripcion: c.descripcion ?? '',
  };
}

function mapValidarOk(b: BackendValidarOk): ValidarCuponResponse {
  return {
    valido: true,
    cupon: {
      id: '',
      codigo: b.codigo,
      tipo: b.tipo,
      valor: typeof b.valor === 'number' ? b.valor : Number(b.valor),
      fecha_expiracion: b.fecha_expiracion,
      usos_maximos: null,
      usos_actuales: 0,
      activo: true,
      created_at: '',
    },
  };
}

function hydrateActivoSlim(s: BackendActivoSlim): Cupon {
  return {
    id: toStr(s.id),
    codigo: s.codigo,
    tipo: '',
    valor: 0,
    fecha_expiracion: '',
    usos_maximos: null,
    usos_actuales: 0,
    activo: s.activo,
    created_at: '',
  };
}

@Injectable({ providedIn: 'root' })
export class CuponesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/cupones`;

  list(): Observable<Cupon[]> {
    return this.http
      .get<BackendCupon[]>(this.base)
      .pipe(map((arr) => arr.map(mapBackendCupon)));
  }

  getById(id: string): Observable<Cupon> {
    return this.http
      .get<BackendCupon>(`${this.base}/${id}`)
      .pipe(map(mapBackendCupon));
  }

  validar(codigo: string): Observable<ValidarCuponResponse> {
    return this.http
      .post<BackendValidarOk>(`${this.base}/validar`, { codigo })
      .pipe(
        map(mapValidarOk),
        catchError((err) => of({ valido: false, mensaje: extractMessage(err) })),
      );
  }

  create(input: CrearCuponInput): Observable<Cupon> {
    const body: components['schemas']['CreateCuponDto'] = {
      codigo: input.codigo,
      tipo: input.tipo,
      valor: input.valor,
      fecha_expiracion: input.fecha_expiracion,
      ...(input.usos_maximos !== null ? { usos_maximos: input.usos_maximos } : {}),
    };
    return this.http
      .post<BackendCupon>(this.base, body)
      .pipe(map(mapBackendCupon));
  }

  update(id: string, input: EditarCuponInput): Observable<Cupon> {
    return this.http
      .patch<BackendCupon>(`${this.base}/${id}`, input)
      .pipe(map(mapBackendCupon));
  }

  setActivo(id: string, activo: boolean): Observable<Cupon> {
    return this.http
      .patch<BackendActivoSlim>(`${this.base}/${id}/activo`, { activo })
      .pipe(map(hydrateActivoSlim));
  }

  toggleStatus(id: string): Observable<Cupon> {
    return this.http
      .patch<BackendActivoSlim>(`${this.base}/${id}/status`, {})
      .pipe(map(hydrateActivoSlim));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<unknown>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }
}
