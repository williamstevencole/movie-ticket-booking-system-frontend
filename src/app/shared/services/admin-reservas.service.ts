import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API_URL } from '../../core/config/env';
import { toNum, toStr } from '../../core/api/normalize';
import { MOCK_RESERVAS } from '../../mocks/data/reservas.mock';

export type AdminReservaRow = {
  id: string;
  numero_reserva: string;
  estado: string;
  num_asientos: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
  usuario?: { id: string; nombre: string; email: string };
  funcion?: { id: string; fecha_hora: string };
  pelicula?: { id: string; titulo: string };
  cine?: { id: string; nombre: string };
};

export type AdminReservaDetail = AdminReservaRow & {
  asientos?: any[];
  notas_internas?: string | null;
  expira_en?: string | null;
  cupon_codigo?: string | null;
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

  list(q: Record<string, any> = {}) {
    // Still mock — admin reservas listado migrates in a later branch.
    let rows: AdminReservaRow[] = MOCK_RESERVAS.map((r) => ({
      id: r.id,
      numero_reserva: r.numero_reserva,
      estado: r.estado,
      num_asientos: r.num_asientos,
      monto_total: r.monto_total,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    if (q['estado']) rows = rows.filter((r) => r.estado === q['estado']);
    const page = Number(q['page'] ?? 1);
    const limit = Number(q['limit'] ?? 10);
    const start = (page - 1) * limit;
    return of({
      data: rows.slice(start, start + limit),
      total: rows.length,
      page,
      limit,
    }).pipe(delay(120));
  }

  getById(id: string | number) {
    const reserva =
      MOCK_RESERVAS.find((r) => r.id === String(id)) ?? MOCK_RESERVAS[0]!;
    const detail: AdminReservaDetail = {
      id: reserva.id,
      numero_reserva: reserva.numero_reserva,
      estado: reserva.estado,
      num_asientos: reserva.num_asientos,
      monto_total: reserva.monto_total,
      created_at: reserva.created_at,
      updated_at: reserva.updated_at,
      asientos: [],
      notas_internas: null,
      expira_en: null,
      cupon_codigo: null,
    };
    return of({ ...detail }).pipe(delay(120));
  }

  cancelar(id: string | number) {
    const reserva =
      MOCK_RESERVAS.find((r) => r.id === String(id)) ?? MOCK_RESERVAS[0]!;
    return of({
      reserva: { ...reserva, estado: 'cancelada' },
      reembolso: null,
    }).pipe(delay(120));
  }

  /**
   * GET /api/admin/reservas/by-numero/:numero/cobrar — admin only.
   * Returns the reserva with precios per asiento resolved server-side
   * (via precios_cine for the reserva's cine). 404 -> emits null so the
   * consumer can show its existing notFound placeholder. Other errors
   * propagate to the subscriber for the error banner.
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
