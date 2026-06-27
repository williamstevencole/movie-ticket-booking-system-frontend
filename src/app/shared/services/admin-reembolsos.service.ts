import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

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

// ── Backend shapes ───────────────────────────────────────────────────────────

type BackendReembolsoRow = {
  id: string;
  numero_reserva: string;
  cliente: { id: string; nombre: string; email: string };
  pelicula: { id: string; titulo: string };
  cine: { id: string; nombre: string };
  metodo_pago_original: string;
  monto: string;
  porcentaje_aplicado: string;
  politica: { id: string; nombre: string } | null;
  dias_en_cola: number;
  estado: string;
  motivo_rechazo: string | null;
  nota: string | null;
  fecha_procesado: string | null;
  created_at: string;
};

type BackendReembolsoPage = {
  data: BackendReembolsoRow[];
  total: number;
  page: number;
  limit: number;
};

type BackendKpis = {
  pendientes: number;
  en_procesamiento: number;
  monto_pendiente: string; // decimal string, ej. "75.00"
  completados_30d: number;
};

// ── Mapper ───────────────────────────────────────────────────────────────────

function mapBackendEstado(e: string): EstadoReembolsoAdmin {
  return (e === 'procesado' ? 'completado' : e) as EstadoReembolsoAdmin;
}

function mapBackendReembolsoRow(r: BackendReembolsoRow): AdminReembolsoRow {
  return {
    id: r.id,
    id_pago: undefined, // not included by backend
    reserva: r.numero_reserva,
    cliente: r.cliente.nombre,
    pelicula: r.pelicula.titulo,
    monto: parseFloat(r.monto),
    metodo: r.metodo_pago_original.toLowerCase() as MetodoReembolso,
    diasEnCola: r.dias_en_cola,
    politica: r.politica?.nombre ?? '(sin política)',
    porcentaje: parseFloat(r.porcentaje_aplicado),
    // Backend enum is lowercase: 'pendiente' | 'procesado' | 'rechazado'
    // 'procesado' maps to frontend 'completado' (semantic match)
    estado: mapBackendEstado(r.estado),
    motivoRechazo: r.motivo_rechazo,
    fechaProcesado: r.fecha_procesado,
    created_at: r.created_at,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminReembolsosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/reembolsos`;

  list(q: Record<string, any> = {}): Observable<{ data: AdminReembolsoRow[]; total: number; page: number; limit: number }> {
    let params = new HttpParams();
    // Reverse-map frontend estado to backend enum values (lowercase, 3-value)
    if (q['estado']) {
      const e = String(q['estado']);
      const backendEstado = e === 'completado' || e === 'procesando' ? 'procesado' : e;
      params = params.set('estado', backendEstado);
    }
    if (q['metodo']) params = params.set('metodo', String(q['metodo'])); // already lowercase
    if (q['q']) params = params.set('q', String(q['q']));
    if (q['fecha_desde']) params = params.set('fecha_desde', String(q['fecha_desde']));
    if (q['fecha_hasta']) params = params.set('fecha_hasta', String(q['fecha_hasta']));
    if (q['page']) params = params.set('page', String(q['page']));
    if (q['limit']) params = params.set('limit', String(q['limit']));

    return this.http
      .get<BackendReembolsoPage>(this.base, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBackendReembolsoRow),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  getById(id: string | number): Observable<AdminReembolsoRow> {
    return this.http
      .get<BackendReembolsoRow>(`${this.base}/${id}`)
      .pipe(map(mapBackendReembolsoRow));
  }

  kpis(): Observable<ReembolsoKpis> {
    return this.http.get<BackendKpis>(`${this.base}/kpis`).pipe(
      map((r) => ({
        pendientes: r.pendientes,
        en_procesamiento: r.en_procesamiento,
        monto_pendiente: parseFloat(r.monto_pendiente),
        completados_30d: r.completados_30d,
      })),
    );
  }

  procesar(
    id: string | number,
    nota?: string,
  ): Observable<{ id: string; estado: EstadoReembolsoAdmin; fechaProcesado: string | null }> {
    return this.http
      .patch<{ id: string; estado: string; fecha_procesado: string | null; nota: string | null }>(
        `${this.base}/${id}/procesar`,
        { nota },
      )
      .pipe(
        map((r) => ({
          id: r.id,
          estado: mapBackendEstado(r.estado),
          fechaProcesado: r.fecha_procesado,
        })),
      );
  }

  rechazar(
    id: string | number,
    motivo: string,
  ): Observable<{ id: string; estado: EstadoReembolsoAdmin; motivoRechazo: string | null }> {
    return this.http
      .patch<{ id: string; estado: string; motivo_rechazo: string | null }>(
        `${this.base}/${id}/rechazar`,
        { motivo_rechazo: motivo },
      )
      .pipe(
        map((r) => ({
          id: r.id,
          estado: mapBackendEstado(r.estado),
          motivoRechazo: r.motivo_rechazo,
        })),
      );
  }
}
