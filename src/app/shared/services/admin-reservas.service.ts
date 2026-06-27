import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { toNum, toStr, toNumOrNull } from '../../core/api/normalize';

export type AdminReservaRow = {
  id: string;
  numero_reserva: string;
  estado: string;
  num_asientos: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
  // Compat fields used by listado consumers (buscar-cliente, etc.)
  id_usuario?: string;
  id_funcion?: string;
  asientos?: any[];
  usuario?: { id: string; nombre: string; email: string };
  funcion?: { id: string; fecha_hora: string };
  pelicula?: { id: string; titulo: string };
  cine?: { id: string; nombre: string };
};

export type AdminAsientoDetail = {
  id: string;
  codigo: string;
  fila: string;
  columna: number;
  tipo: string | null;
};

export type AdminReservaDetail = AdminReservaRow & {
  cupon_codigo?: string | null;
  asientos: AdminAsientoDetail[];
  notas_internas?: string | null;
  expira_en?: string | null;
};

export type UsuarioReserva = {
  id: string;
  nombre: string;
  email: string;
};

export type AsientoCobrar = {
  id: string;
  codigo: string;
  tipo: string;
  precio: number;
};

export type ReservaCobrarDetail = {
  id: string;
  numero_reserva: string;
  estado: string;
  created_at: string;
  expira_en: string | null;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
  };
  pelicula: { id: string; titulo: string };
  funcion: { id: string; fecha_hora: string };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: AsientoCobrar[];
  num_asientos: number;
  monto_total: number;
};

type BackendReservaRow = {
  id: string;
  numero_reserva: string;
  estado: string;
  created_at: string;
  updated_at: string;
  monto_total?: string | null;
  cliente: { id: string; nombre: string; email: string };
  funcion: { id: string; fecha_hora: string };
  pelicula: { id: string; titulo: string };
  cine: { id: string; nombre: string };
  sala: { id: string; nombre: string };
  num_asientos: number;
  asientos: Array<{ codigo: string; tipo: string | null }>;
};

type BackendReservaPage = {
  data: BackendReservaRow[];
  total: number;
  page: number;
  limit: number;
};

type BackendAdminReservaDetail = {
  id: string;
  numero_reserva: string;
  estado: string;
  monto_total: string | null;
  created_at: string;
  updated_at: string;
  notas_internas?: string | null;
  expira_en?: string | null;
  cliente: { id: string; nombre: string; email: string };
  funcion: {
    id: string;
    fecha_hora: string;
    pelicula: { id: string; titulo: string; poster_url?: string | null };
    sala: { id: string; nombre: string };
    cine: { id: string; nombre: string };
  };
  asientos: Array<{
    id: string;
    codigo: string;
    fila: string;
    columna: number;
    tipo: string | null;
  }>;
  pago: {
    id: string;
    monto_final: string;
    metodo: string;
    estado: string;
    created_at: string;
    cupon?: { codigo: string } | null;
  } | null;
};

type BackendCancelarResponse = {
  reserva: {
    id: string;
    numero_reserva: string;
    estado: string;
    fecha_cancelacion: string;
  };
  reembolso: {
    id: string;
    estado: string;
    monto: string;
  } | null;
};

type BackendReservaCobrar = {
  id: string | number;
  numero_reserva: string;
  estado: string;
  created_at: string;
  expira_en: string | null;
  cliente: {
    id: string | number;
    nombre: string;
    email: string;
    telefono: string | null;
  };
  pelicula: { id: string | number; titulo: string };
  funcion: { id: string | number; fecha_hora: string };
  sala: { id: string | number; nombre: string };
  cine: { id: string | number; nombre: string };
  asientos: Array<{
    id: string | number;
    codigo: string;
    tipo: string;
    precio: string | number;
  }>;
  num_asientos: number;
  monto_total: string | number;
};

function mapBackendRow(r: BackendReservaRow): AdminReservaRow {
  return {
    id: toStr(r.id),
    numero_reserva: r.numero_reserva,
    estado: r.estado,
    created_at: r.created_at,
    updated_at: r.updated_at,
    monto_total: toNumOrNull(r.monto_total) ?? 0,
    num_asientos: r.num_asientos,
    // rename: backend "cliente" → frontend "usuario"
    usuario: r.cliente
      ? { id: toStr(r.cliente.id), nombre: r.cliente.nombre, email: r.cliente.email }
      : undefined,
    funcion: r.funcion
      ? { id: toStr(r.funcion.id), fecha_hora: r.funcion.fecha_hora }
      : undefined,
    pelicula: r.pelicula
      ? { id: toStr(r.pelicula.id), titulo: r.pelicula.titulo }
      : undefined,
    cine: r.cine
      ? { id: toStr(r.cine.id), nombre: r.cine.nombre }
      : undefined,
    // Compat fields: derive id_usuario and id_funcion from nested objects
    id_usuario: r.cliente ? toStr(r.cliente.id) : undefined,
    id_funcion: r.funcion ? toStr(r.funcion.id) : undefined,
    asientos: r.asientos?.map((a) => ({ codigo: a.codigo, tipo: a.tipo })) ?? [],
  };
}

function mapBackendAdminReservaDetail(r: BackendAdminReservaDetail): AdminReservaDetail {
  return {
    id: toStr(r.id),
    numero_reserva: r.numero_reserva,
    estado: r.estado,
    created_at: r.created_at,
    updated_at: r.updated_at,
    monto_total: toNumOrNull(r.monto_total) ?? 0,
    notas_internas: r.notas_internas ?? null,
    expira_en: r.expira_en ?? null,
    cupon_codigo: r.pago?.cupon?.codigo ?? null,
    // rename: backend "cliente" → frontend "usuario"
    usuario: r.cliente
      ? { id: toStr(r.cliente.id), nombre: r.cliente.nombre, email: r.cliente.email }
      : undefined,
    funcion: r.funcion
      ? { id: toStr(r.funcion.id), fecha_hora: r.funcion.fecha_hora }
      : undefined,
    pelicula: r.funcion?.pelicula
      ? { id: toStr(r.funcion.pelicula.id), titulo: r.funcion.pelicula.titulo }
      : undefined,
    cine: r.funcion?.cine
      ? { id: toStr(r.funcion.cine.id), nombre: r.funcion.cine.nombre }
      : undefined,
    // num_asientos derived from asientos array
    num_asientos: r.asientos?.length ?? 0,
    // Compat fields for consumers that read id_usuario / id_funcion
    id_usuario: r.cliente ? toStr(r.cliente.id) : undefined,
    id_funcion: r.funcion ? toStr(r.funcion.id) : undefined,
    // Full asiento detail with fila trimmed
    asientos: r.asientos?.map((a) => ({
      id: toStr(a.id),
      codigo: a.codigo,
      fila: a.fila?.trim() ?? '',
      columna: a.columna,
      tipo: a.tipo,
    })) ?? [],
  };
}

function mapBackendReservaCobrar(r: BackendReservaCobrar): ReservaCobrarDetail {
  return {
    id: toStr(r.id),
    numero_reserva: r.numero_reserva,
    estado: r.estado,
    created_at: r.created_at,
    expira_en: r.expira_en,
    cliente: {
      id: toStr(r.cliente.id),
      nombre: r.cliente.nombre,
      email: r.cliente.email,
      telefono: r.cliente.telefono,
    },
    pelicula: { id: toStr(r.pelicula.id), titulo: r.pelicula.titulo },
    funcion: { id: toStr(r.funcion.id), fecha_hora: r.funcion.fecha_hora },
    sala: { id: toStr(r.sala.id), nombre: r.sala.nombre },
    cine: { id: toStr(r.cine.id), nombre: r.cine.nombre },
    asientos: r.asientos.map((a) => ({
      id: toStr(a.id),
      codigo: a.codigo,
      tipo: a.tipo,
      precio: toNum(a.precio),
    })),
    num_asientos: r.num_asientos,
    monto_total: toNum(r.monto_total),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminReservasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/reservas`;

  list(q: Record<string, any> = {}): Observable<{
    data: AdminReservaRow[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams();
    if (q['estado']) params = params.set('estado', String(q['estado']));
    if (q['q']) params = params.set('q', String(q['q']));
    if (q['search']) params = params.set('q', String(q['search']));
    if (q['page']) params = params.set('page', String(q['page']));
    if (q['limit']) params = params.set('limit', String(q['limit']));
    return this.http
      .get<BackendReservaPage>(this.base, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBackendRow),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  /**
   * Returns unique users who have reservas.
   * No dedicated backend endpoint — derived from the first page of the list.
   * Full list endpoint is paginated; Task 2 may improve this or replace it.
   */
  listUsuarios(): Observable<UsuarioReserva[]> {
    return this.list({ limit: 200 }).pipe(
      map((res) =>
        Array.from(
          new Map(
            res.data
              .filter((r) => r.usuario)
              .map((r) => [r.usuario!.id, r.usuario!]),
          ).values(),
        ),
      ),
    );
  }

  getById(id: string | number): Observable<AdminReservaDetail> {
    return this.http
      .get<BackendAdminReservaDetail>(`${this.base}/${id}`)
      .pipe(map(mapBackendAdminReservaDetail));
  }

  cancelar(id: string | number): Observable<{
    reserva: { id: string; numero_reserva: string; estado: string; fecha_cancelacion: string };
    reembolso: { id: string; estado: string; monto: number } | null;
  }> {
    return this.http
      .patch<BackendCancelarResponse>(`${this.base}/${id}/cancelar`, {})
      .pipe(
        map((res) => ({
          reserva: {
            id: toStr(res.reserva.id),
            numero_reserva: res.reserva.numero_reserva,
            estado: res.reserva.estado,
            fecha_cancelacion: res.reserva.fecha_cancelacion,
          },
          reembolso: res.reembolso
            ? {
                id: toStr(res.reembolso.id),
                estado: res.reembolso.estado,
                monto: toNum(res.reembolso.monto),
              }
            : null,
        })),
      );
  }

  /**
   * GET /admin/reservas/by-numero/:numero/cobrar — admin only.
   * Returns the reserva with precios per asiento resolved server-side.
   * 404 → emits null so the consumer can show its existing notFound placeholder.
   * Other errors propagate to the subscriber for the error banner.
   */
  getByNumero(numero: string): Observable<ReservaCobrarDetail | null> {
    if (!numero) return of(null);
    const url = `${this.base}/by-numero/${encodeURIComponent(numero)}/cobrar`;
    return this.http.get<BackendReservaCobrar>(url).pipe(
      map((r) => mapBackendReservaCobrar(r)),
      catchError((err) => {
        if (err?.status === 404) return of(null);
        throw err;
      }),
    );
  }
}
