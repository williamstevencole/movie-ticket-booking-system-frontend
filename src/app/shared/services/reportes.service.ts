import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { toNum, toStr } from '../../core/api/normalize';

// --- Generic page wrapper ---
export type Page<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// --- Reservas report row (server-side aggregated) ---
export type ReporteReservaRow = {
  id: string;
  numero_reserva: string;
  id_usuario: string;
  nombre_usuario: string;
  email_usuario: string;
  id_funcion: string;
  fecha_hora_funcion: string;
  titulo_pelicula: string;
  nombre_cine: string;
  nombre_sala: string;
  num_asientos: number;
  monto_total: number;
  estado: 'pendiente_pago' | 'pagada' | 'cancelada' | 'reembolsada' | 'expirada';
  created_at: string;
};

// --- Pagos report row ---
export type ReportePagoRow = {
  id: string;
  id_reserva: string;
  numero_reserva: string;
  nombre_usuario: string;
  email_usuario: string;
  nombre_cine: string;
  metodo: 'tarjeta' | 'efectivo';
  monto_original: number;
  monto_descuento: number;
  monto_final: number;
  estado: 'procesando' | 'exitoso' | 'rechazado' | 'reembolsado';
  referencia_externa: string | null;
  created_at: string;
};

// --- Cancelaciones report ---
export type CancelacionesReporte = {
  total_canceladas: number;
  tasa: number;
  por_politica: Array<{ nombre: string; count: number }>;
  por_cine: Array<{ nombre: string; count: number }>;
  tendencia_30d: Array<{ fecha: string; count: number }>;
};

type BackendReporteReservaItem = {
  id: string | number;
  numeroReserva: string;
  estado: string;
  usuario: { id: string | number; nombre: string; email: string };
  funcion: {
    id: string | number;
    fechaHora: string;
    pelicula: { id: string | number; titulo: string };
    sala: {
      id: string | number;
      nombre: string;
      cine: { id: string | number; nombre: string };
    };
  };
  numAsientos: number;
  montoTotal: number | string;
  createdAt: string;
  updatedAt: string;
};

type BackendReporteReservasPage = {
  data: BackendReporteReservaItem[];
  total: number;
  page: number;
  limit: number;
};

function mapBackendReporteReserva(
  r: BackendReporteReservaItem,
): ReporteReservaRow {
  return {
    id: toStr(r.id),
    numero_reserva: r.numeroReserva,
    id_usuario: toStr(r.usuario.id),
    nombre_usuario: r.usuario.nombre,
    email_usuario: r.usuario.email,
    id_funcion: toStr(r.funcion.id),
    fecha_hora_funcion: r.funcion.fechaHora,
    titulo_pelicula: r.funcion.pelicula.titulo,
    nombre_cine: r.funcion.sala.cine.nombre,
    nombre_sala: r.funcion.sala.nombre,
    num_asientos: r.numAsientos,
    monto_total: toNum(r.montoTotal),
    estado: r.estado as ReporteReservaRow['estado'],
    created_at: r.createdAt,
  };
}

// ── Pagos backend types ────────────────────────────────────────────────────
type BackendReportePagoItem = {
  id: string;
  montoOriginal: number;
  montoFinal: number;
  metodo: string;
  estado: string;
  referenciaExterna: string | null;
  reserva: { id: string; numeroReserva: string };
  cupon?: { id: string; codigo: string };
  reembolsos: Array<{ id: string; montoReembolso: number }>;
  createdAt: string;
};

type BackendReportePagosPage = {
  data: BackendReportePagoItem[];
  total: number;
  page: number;
  limit: number;
  resumen: { totalMontoOriginal: number; totalMontoFinal: number };
};

function mapBackendReportePago(p: BackendReportePagoItem): ReportePagoRow {
  return {
    id: p.id,
    id_reserva: p.reserva.id,
    numero_reserva: p.reserva.numeroReserva,
    nombre_usuario: '',       // backend no incluye usuario en este endpoint
    email_usuario: '',        // backend no incluye usuario en este endpoint
    nombre_cine: '',          // backend no incluye cine en este endpoint
    metodo: p.metodo.toLowerCase() as ReportePagoRow['metodo'],
    monto_original: p.montoOriginal,
    monto_descuento: p.montoOriginal - p.montoFinal,  // derivado
    monto_final: p.montoFinal,
    estado: p.estado.toLowerCase() as ReportePagoRow['estado'],
    referencia_externa: p.referenciaExterna,
    created_at: p.createdAt,
  };
}

// ── Cancelaciones backend types ────────────────────────────────────────────
type BackendCancelacionesResponse = {
  total_canceladas: number;
  tasa: number;          // fracción 0–1; el frontend lo espera multiplicado x 100
  por_politica: Array<{ nombre: string; count: number }>;
  por_cine: Array<{ nombre: string; count: number }>;
  tendencia_30d: Array<{ fecha: string; count: number }>;
};

function mapBackendCancelaciones(r: BackendCancelacionesResponse): CancelacionesReporte {
  return {
    total_canceladas: r.total_canceladas,
    tasa: Math.round(r.tasa * 100),   // backend: 0.15 → frontend: 15 (porcentaje entero)
    por_politica: r.por_politica,
    por_cine: r.por_cine,
    tendencia_30d: r.tendencia_30d,
  };
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly reservasBase = `${API_URL}/admin/reportes/reservas`;
  private readonly pagosBase = `${API_URL}/admin/reportes/pagos`;
  private readonly cancelacionesBase = `${API_URL}/admin/reportes/cancelaciones`;

  reservas(q: Record<string, any> = {}): Observable<Page<ReporteReservaRow>> {
    const params = this.buildReservasParams(q);
    return this.http
      .get<BackendReporteReservasPage>(this.reservasBase, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBackendReporteReserva),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  reservasCsv(q: Record<string, any> = {}): Observable<Blob> {
    const params = this.buildReservasParams(q);
    return this.http.get(`${this.reservasBase}/export`, {
      params,
      responseType: 'blob',
    });
  }

  pagos(q: Record<string, any> = {}): Observable<Page<ReportePagoRow>> {
    let params = new HttpParams();
    if (q['estado']) params = params.set('estado', String(q['estado']));
    if (q['fecha']) params = params.set('fecha', String(q['fecha']));
    if (q['page']) params = params.set('page', String(q['page']));
    if (q['limit']) params = params.set('limit', String(q['limit']));

    return this.http
      .get<BackendReportePagosPage>(this.pagosBase, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBackendReportePago),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  cancelaciones(q: Record<string, any> = {}): Observable<CancelacionesReporte> {
    let params = new HttpParams();
    // El backend usa fecha_desde/fecha_hasta; el componente pasa 'desde'/'hasta'
    if (q['desde']) params = params.set('fecha_desde', String(q['desde']));
    if (q['hasta']) params = params.set('fecha_hasta', String(q['hasta']));
    if (q['id_cine']) params = params.set('id_cine', String(q['id_cine']));
    // Nota: q['id_politica'] que construye el componente no existe en CancelacionesQueryDto;
    // el backend lo ignora silenciosamente.

    return this.http
      .get<BackendCancelacionesResponse>(this.cancelacionesBase, { params })
      .pipe(map(mapBackendCancelaciones));
  }

  private buildReservasParams(q: Record<string, any>): HttpParams {
    let params = new HttpParams();
    const map: Array<[string, string]> = [
      // [frontend key, backend key]
      ['search', 'search'],
      ['id_cine', 'idCine'],
      ['id_ciudad', 'idCiudad'],
      ['id_pelicula', 'idPelicula'],
      ['estado', 'estado'],
      ['desde', 'desde'],
      ['hasta', 'hasta'],
      ['page', 'page'],
      ['limit', 'limit'],
    ];
    for (const [feKey, beKey] of map) {
      const v = q[feKey];
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(beKey, String(v));
      }
    }
    return params;
  }
}
