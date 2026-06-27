import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API_URL } from '../../core/config/env';
import { toStr } from '../../core/api/normalize';
import { TipoAsiento } from '../../features/asientos/mapa/seat-types/seat-type.model';
import { EstadoAsiento } from '../../features/asientos/mapa/seat-states/seat-state.model';

export type AsientoFuncion = {
  id: string;
  fila: string;
  numero: number;
  tipo: TipoAsiento;
  estado: EstadoAsiento;
  bloqueado_hasta?: string;
  version: number;
  precio?: number;
};

export type MapaAsientos = {
  id_funcion: string;
  expira_en?: string;
  asientos: AsientoFuncion[];
};

type BackendAsientoItem = {
  id_asiento_funcion: string | number;
  fila: string;
  columna: number;
  codigo: string;
  tipo: string;
  estado: string;
  es_mio: boolean;
};
type BackendMapa = {
  funcion_id: string | number;
  sala: { filas: number; columnas: number };
  asientos: BackendAsientoItem[];
};

/** Normaliza el nombre del tipo de asiento del backend a la categoría de UI. */
function mapTipo(tipo: string): TipoAsiento {
  const n = (tipo ?? '').toLowerCase();
  if (n.includes('vip')) return 'vip';
  if (n.includes('acces') || n.includes('discapac') || n.includes('silla')) {
    return 'accesible';
  }
  return 'estandar';
}

/**
 * Mapea el estado del backend al de la UI.
 * - DISPONIBLE → disponible
 * - BLOQUEADO mío → seleccionado; ajeno → bloqueado
 * - RESERVADO / OCUPADO / VENDIDO → ocupado (no disponible)
 */
function mapEstado(estado: string, esMio: boolean): EstadoAsiento {
  switch ((estado ?? '').toUpperCase()) {
    case 'DISPONIBLE':
      return 'disponible';
    case 'BLOQUEADO':
      return esMio ? 'seleccionado' : 'bloqueado';
    case 'RESERVADO':
    case 'OCUPADO':
    case 'VENDIDO':
      return 'ocupado';
    default:
      return 'ocupado';
  }
}

@Injectable({ providedIn: 'root' })
export class AsientosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/funciones`;

  /** Mapa de asientos de una función (GET /funciones/:id/asientos). */
  mapa(idFuncion: string | number): Observable<MapaAsientos> {
    return this.http
      .get<BackendMapa>(`${this.base}/${idFuncion}/asientos`)
      .pipe(map((res) => this.toMapa(res)));
  }

  private toMapa(res: BackendMapa): MapaAsientos {
    return {
      id_funcion: toStr(res.funcion_id),
      asientos: (res.asientos ?? []).map((a) => ({
        id: toStr(a.id_asiento_funcion),
        fila: a.fila,
        numero: a.columna,
        tipo: mapTipo(a.tipo),
        estado: mapEstado(a.estado, a.es_mio),
        version: 1,
      })),
    };
  }

  // TODO(Card 6): reemplazar por POST /funciones/:id/asientos/bloquear
  bloquear(idFuncion: string | number, ids: (string | number)[]) {
    void idFuncion;
    void ids;
    const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return of({ expira_en: expira }).pipe(delay(120));
  }
}
