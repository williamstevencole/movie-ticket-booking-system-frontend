import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API_URL } from '../../core/config/env';
import { toNum, toStr } from '../../core/api/normalize';
import { MOCK_PAGOS } from '../../mocks/data/pagos.mock';
import { MOCK_RESERVAS } from '../../mocks/data/reservas.mock';

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

const USUARIOS_MAP: Record<string, { nombre: string; email: string }> = {
  'u-1': { nombre: 'Andrea López', email: 'andrea.lopez@gmail.com' },
  'u-2': { nombre: 'Marco Rodríguez', email: 'marco.rod@gmail.com' },
  'u-3': { nombre: 'Sofía García', email: 'sofia.garcia@outlook.com' },
  'u-4': { nombre: 'Daniel Méndez', email: 'dmendez@gmail.com' },
  'u-5': { nombre: 'Lucía Hernández', email: 'lucia.h@hotmail.com' },
  'u-6': { nombre: 'Pablo Castillo', email: 'pcastillo@gmail.com' },
  'u-7': { nombre: 'Camila Reyes', email: 'cami.reyes@gmail.com' },
  'u-8': { nombre: 'Javier Morales', email: 'j.morales@yahoo.com' },
  'u-9': { nombre: 'Isabella Cruz', email: 'isa.cruz@gmail.com' },
  'u-10': { nombre: 'Rodrigo Paz', email: 'rpaz@gmail.com' },
  'u-11': { nombre: 'Valeria Torres', email: 'valeria.t@gmail.com' },
  'u-12': { nombre: 'Mateo Aguilar', email: 'mateo.a@gmail.com' },
};

const CINES_LIST = ['Cinépolis Oakland Mall', 'Multiplaza', 'Cinépolis City Mall', 'Multiplaza San Salvador'];

const MOCK_REPORTE_PAGOS: ReportePagoRow[] = MOCK_PAGOS.map((p, i) => {
  const reserva = MOCK_RESERVAS.find((r) => r.id === p.id_reserva);
  const u = USUARIOS_MAP[reserva?.id_usuario ?? ''] ?? { nombre: 'Usuario', email: 'user@example.com' };
  return {
    id: p.id,
    id_reserva: p.id_reserva,
    numero_reserva: reserva?.numero_reserva ?? `CIN-R-${String(i).padStart(4, '0')}`,
    nombre_usuario: u.nombre,
    email_usuario: u.email,
    nombre_cine: CINES_LIST[i % CINES_LIST.length]!,
    metodo: p.metodo,
    monto_original: p.monto_original,
    monto_descuento: p.monto_descuento,
    monto_final: p.monto_final,
    estado: p.estado,
    referencia_externa: p.referencia_externa,
    created_at: p.created_at,
  };
});

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly reservasBase = `${API_URL}/admin/reportes/reservas`;

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

  pagos(q: Record<string, any> = {}) {
    let rows = [...MOCK_REPORTE_PAGOS];
    if (q['estado']) rows = rows.filter((r) => r.estado === q['estado']);
    if (q['metodo']) rows = rows.filter((r) => r.metodo === q['metodo']);
    const page = Number(q['page'] ?? 1);
    const limit = Number(q['limit'] ?? 10);
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit } as Page<ReportePagoRow>).pipe(delay(120));
  }

  cancelaciones(q: Record<string, any> = {}) {
    const canceladas = MOCK_RESERVAS.filter((r) => r.estado === 'cancelada');
    const tasa = Math.round((canceladas.length / MOCK_RESERVAS.length) * 100);
    const result: CancelacionesReporte = {
      total_canceladas: canceladas.length,
      tasa,
      por_politica: [
        { nombre: 'Flexible 24h', count: 4 },
        { nombre: 'Estricta 12h', count: 2 },
        { nombre: 'Sin política', count: canceladas.length - 6 },
      ],
      por_cine: CINES_LIST.map((nombre, i) => ({ nombre, count: Math.max(1, canceladas.length - i * 2) })),
      tendencia_30d: Array.from({ length: 10 }, (_, i) => ({
        fecha: new Date(Date.now() - (9 - i) * 3 * 86400000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 3) + 1,
      })),
    };
    return of(result).pipe(delay(120));
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
