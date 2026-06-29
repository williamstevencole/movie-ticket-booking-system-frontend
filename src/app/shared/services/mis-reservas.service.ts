import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { EstadoReserva, ReservaAsiento } from './reservas.service';

export interface Boleto {
  id: string;
  numero_reserva: string;
  estado: EstadoReserva;
  created_at: string;
  id_funcion: string;
  fecha_hora: string;
  expira_en: string | null;
  pelicula: { id: string; titulo: string; poster_url: string | null; rating_promedio?: number | null; rating_count?: number };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: ReservaAsiento[];
  monto_total: number;
  /** Método del pago asociado (null si todavía no hay pago). */
  metodo: 'tarjeta' | 'efectivo' | null;
  ultimos4_snapshot: string | null;
  marca_snapshot: 'visa' | 'master' | 'amex' | 'discover' | null;
  /** Estado de la función (para ocultar acciones si fue cancelada). */
  funcionEstado: string;
}

type BackendBoleto = {
  id: string;
  numero_reserva: string;
  estado: string;
  created_at: string;
  id_funcion: string;
  fecha_hora: string;
  expira_en: string | null;
  pelicula: { id: string; titulo: string; poster_url: string | null; rating_promedio: string | null; rating_count: number };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: Array<{ id: string; codigo: string; fila: string; columna: number; tipo_asiento: string | null; precio: string | null }>;
  monto_total: string | null;
  metodo: string | null;
  ultimos4_snapshot: string | null;
  marca_snapshot: string | null;
  funcion_estado: string;
};

function mapBoleto(r: BackendBoleto): Boleto {
  return {
    id: r.id,
    numero_reserva: r.numero_reserva,
    estado: r.estado as EstadoReserva,
    created_at: r.created_at,
    id_funcion: r.id_funcion,
    fecha_hora: r.fecha_hora,
    expira_en: r.expira_en ?? null,
    pelicula: {
      id: r.pelicula.id,
      titulo: r.pelicula.titulo,
      poster_url: r.pelicula.poster_url,
      rating_promedio: r.pelicula.rating_promedio != null ? parseFloat(r.pelicula.rating_promedio) : null,
      rating_count: r.pelicula.rating_count,
    },
    sala: r.sala,
    cine: r.cine,
    asientos: r.asientos.map((a) => ({
      id: a.id,
      id_asiento_funcion: a.id,
      codigo: a.codigo,
      fila: a.fila,
      columna: a.columna,
      tipo_asiento: a.tipo_asiento ?? 'Estándar',
      precio: a.precio != null ? parseFloat(a.precio) : 0,
    })),
    monto_total: r.monto_total != null ? parseFloat(r.monto_total) : 0,
    metodo: (r.metodo as Boleto['metodo']) ?? null,
    ultimos4_snapshot: r.ultimos4_snapshot,
    marca_snapshot: r.marca_snapshot as Boleto['marca_snapshot'],
    funcionEstado: r.funcion_estado,
  };
}

@Injectable({ providedIn: 'root' })
export class MisReservasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/me/reservas`;

  list(opts: {
    estado?: string;
    page?: number;
    limit?: number;
    vista?: 'proximos' | 'pasados' | 'cancelados';
  } = {}): Observable<MisReservasPage> {
    let params = new HttpParams();
    if (opts.estado) params = params.set('estado', opts.estado);
    if (opts.vista) params = params.set('vista', opts.vista);
    if (opts.page) params = params.set('page', String(opts.page));
    if (opts.limit) params = params.set('limit', String(opts.limit));
    return this.http
      .get<{ data: BackendBoleto[]; total: number; page: number; limit: number }>(this.base, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBoleto),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  getByNumero(numero: string): Observable<Boleto | null> {
    return this.http
      .get<BackendBoleto>(`${this.base}/${numero}`)
      .pipe(
        map(mapBoleto),
        catchError(() => of(null)),
      );
  }

  cancelar(numero: string): Observable<CancelarMiReservaResponse> {
    return this.http.patch<CancelarMiReservaResponse>(
      `${this.base}/${numero}/cancelar`,
      {},
    );
  }
}

export type MisReservasPage = {
  data: Boleto[];
  total: number;
  page: number;
  limit: number;
};

export type CancelarMiReservaResponse = {
  reserva: {
    id_reserva: string;
    numero_reserva: string;
    estado: string;
    fecha_cancelacion: string;
  };
  reembolso: {
    id_reembolso: string;
    estado: string;
    monto: string;
  } | null;
};
