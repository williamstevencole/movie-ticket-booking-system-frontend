import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';
import { MOCK_PAGOS } from '../../mocks/data/pagos.mock';

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

export type PagoRow = Pago;
export type PagoDetail = Pago;

type BackendPagoEfectivoResponse = {
  id_pago: string | number;
  estado: string;
  monto_original: string | number;
  monto_descuento: string | number;
  monto_final: string | number;
  numero_reserva: string;
};

function mapBackendPagoEfectivo(
  r: BackendPagoEfectivoResponse,
  idReserva: string,
): Pago {
  return {
    id: toStr(r.id_pago),
    id_reserva: idReserva,
    monto_original:
      typeof r.monto_original === 'number'
        ? r.monto_original
        : Number(r.monto_original),
    monto_descuento:
      typeof r.monto_descuento === 'number'
        ? r.monto_descuento
        : Number(r.monto_descuento),
    monto_final:
      typeof r.monto_final === 'number'
        ? r.monto_final
        : Number(r.monto_final),
    metodo: 'efectivo',
    estado: r.estado as EstadoPago,
    referencia_externa: null,
    created_at: new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/pagos`;

  list(q: Record<string, any> = {}) {
    let rows = [...MOCK_PAGOS];
    if (q['estado']) rows = rows.filter((p) => p.estado === q['estado']);
    if (q['metodo']) rows = rows.filter((p) => p.metodo === q['metodo']);
    const page = Number(q['page'] ?? 1);
    const limit = Number(q['limit'] ?? 10);
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit) as PagoRow[], total: rows.length, page, limit }).pipe(delay(120));
  }

  getById(id: string | number) {
    const found = MOCK_PAGOS.find((p) => p.id === String(id)) ?? MOCK_PAGOS[0]!;
    return of({ ...found } as PagoDetail).pipe(delay(120));
  }

  getByReserva(idReserva: string | number) {
    const results = MOCK_PAGOS.filter((p) => p.id_reserva === String(idReserva));
    return of(results.length ? results : [MOCK_PAGOS[0]!] as PagoDetail[]).pipe(delay(120));
  }

  /** POST /api/pagos — tarjeta (cliente) */
  crearTarjeta(input: {
    id_reserva: string;
    metodo: 'tarjeta';
    referencia_externa?: string;
    codigo_cupon?: string;
  }) {
    const mock: Pago = {
      id: `pg-new-${Date.now()}`,
      id_reserva: input.id_reserva,
      monto_original: 170,
      monto_descuento: 0,
      monto_final: 170,
      metodo: 'tarjeta',
      estado: 'exitoso',
      referencia_externa: input.referencia_externa ?? `TX${Date.now()}`,
      ultimos4_snapshot: '4242',
      marca_snapshot: 'visa',
      created_at: new Date().toISOString(),
    };
    return of(mock).pipe(delay(120));
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
