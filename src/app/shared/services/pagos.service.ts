import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
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

@Injectable({ providedIn: 'root' })
export class PagosService {
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
  crearEfectivo(input: { id_reserva: string; codigo_cupon?: string }) {
    const mock: Pago = {
      id: `pg-eff-${Date.now()}`,
      id_reserva: input.id_reserva,
      monto_original: 170,
      monto_descuento: 0,
      monto_final: 170,
      metodo: 'efectivo',
      estado: 'exitoso',
      referencia_externa: null,
      created_at: new Date().toISOString(),
    };
    return of(mock).pipe(delay(120));
  }
}
