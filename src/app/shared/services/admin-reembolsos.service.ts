import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_REEMBOLSOS_ADMIN } from '../../mocks/data/reembolsos-admin.mock';

export type EstadoReembolsoAdmin = 'pendiente' | 'procesando' | 'completado' | 'rechazado';
export type MetodoReembolso = 'tarjeta' | 'efectivo';

export type ReembolsoKpis = {
  pendientes: number;
  en_procesamiento: number;
  monto_pendiente: number;
  completados_30d: number;
};

export type AdminReembolsoRow = {
  id: string;
  id_pago?: string;
  /** Número de reserva */
  reserva: string;
  cliente: string;
  pelicula: string;
  monto: number;
  metodo: MetodoReembolso;
  diasEnCola: number;
  politica: string;
  porcentaje: number;
  estado: EstadoReembolsoAdmin;
  motivoRechazo: string | null;
  fechaProcesado: string | null;
  created_at: string;
};

/** Alias kept for backward compat with the admin/reembolsos component */
export type ReembolsoAdmin = AdminReembolsoRow;

@Injectable({ providedIn: 'root' })
export class AdminReembolsosService {
  list(q: Record<string, any> = {}) {
    let rows = [...MOCK_REEMBOLSOS_ADMIN];
    if (q['estado']) rows = rows.filter((r) => r.estado === q['estado']);
    const page = Number(q['page'] ?? 1);
    const limit = Number(q['limit'] ?? 10);
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit }).pipe(delay(120));
  }

  getById(id: string | number) {
    const found = MOCK_REEMBOLSOS_ADMIN.find((r) => r.id === String(id)) ?? MOCK_REEMBOLSOS_ADMIN[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  kpis() {
    const pendientes = MOCK_REEMBOLSOS_ADMIN.filter((r) => r.estado === 'pendiente').length;
    const procesando = MOCK_REEMBOLSOS_ADMIN.filter((r) => r.estado === 'procesando').length;
    const montoPendiente = MOCK_REEMBOLSOS_ADMIN
      .filter((r) => r.estado === 'pendiente' || r.estado === 'procesando')
      .reduce((s, r) => s + r.monto, 0);
    const completados = MOCK_REEMBOLSOS_ADMIN.filter((r) => r.estado === 'completado').length;
    const result: ReembolsoKpis = {
      pendientes,
      en_procesamiento: procesando,
      monto_pendiente: montoPendiente,
      completados_30d: completados,
    };
    return of(result).pipe(delay(120));
  }

  procesar(id: string | number, nota?: string) {
    const found = MOCK_REEMBOLSOS_ADMIN.find((r) => r.id === String(id)) ?? MOCK_REEMBOLSOS_ADMIN[0]!;
    return of({ ...found, estado: 'completado' as EstadoReembolsoAdmin, fechaProcesado: new Date().toISOString() }).pipe(delay(120));
  }

  rechazar(id: string | number, motivo: string) {
    const found = MOCK_REEMBOLSOS_ADMIN.find((r) => r.id === String(id)) ?? MOCK_REEMBOLSOS_ADMIN[0]!;
    return of({ ...found, estado: 'rechazado' as EstadoReembolsoAdmin, motivoRechazo: motivo }).pipe(delay(120));
  }
}
