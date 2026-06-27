import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type MetodoPago = 'tarjeta' | 'efectivo';
export type EstadoPago = 'procesando' | 'exitoso' | 'rechazado' | 'reembolsado';

export type Pago = {
  id: string;
  id_reserva: string;
  monto_original: number;
  monto_descuento: number;
  monto_final: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  referencia_externa: string | null;
  ultimos4_snapshot?: string | null;
  marca_snapshot?: 'visa' | 'master' | 'amex' | 'discover';
  id_metodo_pago?: string;
  id_cupon?: string;
  created_at: string;
};

/** Extended type for the admin list view — includes denormalized fields from the backend. */
export type PagoAdminRow = Pago & {
  numero_reserva?: string;
  cliente?: { id: string; nombre: string; email: string };
  cine?: { id: string; nombre: string };
  ciudad?: { id: string; nombre: string };
};

export type PagoRow = PagoAdminRow;
export type PagoDetail = PagoAdminRow;

// ── Backend shapes ─────────────────────────────────────────────────────────────

type BackendPagoAdminItem = {
  id: string;
  referencia_externa: string | null;
  numero_reserva: string;
  cliente: { id: string; nombre: string; email: string };
  cine: { id: string; nombre: string };
  ciudad: { id: string; nombre: string };
  metodo: string;
  monto_original: string | number;
  monto_descuento: string | number;
  monto_final: string | number;
  estado: string;
  ultimos4_snapshot: string | null;
  marca_snapshot: string | null;
  cupon: { id: string; [k: string]: unknown } | null;
  id_reserva: string;
  created_at: string;
};

type BackendPagoAdminPage = {
  data: BackendPagoAdminItem[];
  total: number;
  page: number;
  limit: number;
};

type BackendPagoEfectivoResponse = {
  id_pago: string | number;
  estado: string;
  monto_original: string | number;
  monto_descuento: string | number;
  monto_final: string | number;
  numero_reserva: string;
};

// ── Mappers ────────────────────────────────────────────────────────────────────

function toNum(v: string | number): number {
  return typeof v === 'number' ? v : Number(v);
}

function mapAdminPago(p: BackendPagoAdminItem): PagoAdminRow {
  return {
    id: p.id,
    id_reserva: p.id_reserva,
    monto_original: toNum(p.monto_original),
    monto_descuento: toNum(p.monto_descuento),
    monto_final: toNum(p.monto_final),
    metodo: p.metodo.toLowerCase() as MetodoPago,
    estado: p.estado.toLowerCase() as EstadoPago,
    referencia_externa: p.referencia_externa,
    ultimos4_snapshot: p.ultimos4_snapshot,
    marca_snapshot: (p.marca_snapshot?.toLowerCase() ?? undefined) as Pago['marca_snapshot'],
    id_cupon: p.cupon?.id,
    created_at: p.created_at,
    // Denormalized enrichment from backend
    numero_reserva: p.numero_reserva,
    cliente: p.cliente,
    cine: p.cine,
    ciudad: p.ciudad,
  };
}

function mapBackendPagoEfectivo(
  r: BackendPagoEfectivoResponse,
  idReserva: string,
): Pago {
  return {
    id: toStr(r.id_pago),
    id_reserva: idReserva,
    monto_original: toNum(r.monto_original),
    monto_descuento: toNum(r.monto_descuento),
    monto_final: toNum(r.monto_final),
    metodo: 'efectivo',
    estado: r.estado as EstadoPago,
    referencia_externa: null,
    created_at: new Date().toISOString(),
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/pagos`;
  private readonly adminBase = `${API_URL}/admin/pagos`;

  /** GET /admin/pagos — paginated list with denormalized enrichment fields */
  list(q: Record<string, unknown> = {}): Observable<{ data: PagoAdminRow[]; total: number; page: number; limit: number }> {
    let params = new HttpParams();
    if (q['estado']) params = params.set('estado', String(q['estado']));
    if (q['metodo']) params = params.set('metodo', String(q['metodo']));
    if (q['page']) params = params.set('page', String(q['page']));
    if (q['limit']) params = params.set('limit', String(q['limit']));
    return this.http
      .get<BackendPagoAdminPage>(this.adminBase, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapAdminPago),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  /** GET /admin/pagos/:id — same shape as list row */
  getById(id: string | number): Observable<PagoDetail> {
    return this.http
      .get<BackendPagoAdminItem>(`${this.adminBase}/${id}`)
      .pipe(map(mapAdminPago));
  }

  /** GET /admin/pagos/reserva/:idReserva — array, same shape */
  getByReserva(idReserva: string | number): Observable<PagoDetail[]> {
    return this.http
      .get<BackendPagoAdminItem[]>(`${this.adminBase}/reserva/${idReserva}`)
      .pipe(map((arr) => arr.map(mapAdminPago)));
  }

  /** POST /api/pagos — tarjeta (cliente self-service) */
  crearTarjeta(input: {
    id_reserva: string;
    metodo: 'tarjeta';
    referencia_externa?: string;
    codigo_cupon?: string;
  }): Observable<Pago> {
    return this.http.post<Pago>(`${this.base}`, {
      id_reserva: input.id_reserva,
      metodo: input.metodo,
      ...(input.referencia_externa ? { referencia_externa: input.referencia_externa } : {}),
      ...(input.codigo_cupon ? { codigo_cupon: input.codigo_cupon } : {}),
    });
  }

  /** POST /api/pagos/efectivo — admin only; not available for cliente self-service */
  crearEfectivo(input: { id_reserva: string; codigo_cupon?: string }): Observable<Pago> {
    const body: components['schemas']['CrearPagoEfectivoDto'] = {
      id_reserva: input.id_reserva,
      ...(input.codigo_cupon ? { codigo_cupon: input.codigo_cupon } : {}),
    };
    return this.http
      .post<BackendPagoEfectivoResponse>(`${this.base}/efectivo`, body)
      .pipe(map((r) => mapBackendPagoEfectivo(r, input.id_reserva)));
  }
}
