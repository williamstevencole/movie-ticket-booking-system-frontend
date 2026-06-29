import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { toStr } from '../../core/api/normalize';
import { TipoAsiento } from '../../features/asientos/mapa/seat-types/seat-type.model';
import { EstadoAsiento } from '../../features/asientos/mapa/seat-states/seat-state.model';

export type AsientoFuncion = {
  id: string;
  fila: string;
  numero: number;
  tipo: TipoAsiento;
  /** Nombre real del tipo de asiento (backend). */
  tipoLabel: string;
  /** Color real del tipo (hex) configurado en admin; null si no tiene. */
  color: string | null;
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
  tipo_color?: string | null;
  estado: string;
  es_mio: boolean;
};
type BackendMapa = {
  funcion_id: string | number;
  sala: { filas: number; columnas: number };
  asientos: BackendAsientoItem[];
};

type BackendBloqueoResp = {
  bloqueados: (string | number)[];
  bloqueado_hasta: string;
};

export type ResultadoBloqueo = {
  bloqueados: string[];
  /** ISO hasta el que los asientos quedan bloqueados (alias para el timer del UI). */
  expira_en: string;
};

/** Nombre del tipo reservado para asientos deshabilitados (mal estado, etc.). */
const TIPO_FUERA_DE_SERVICIO = 'fuera de servicio';

function esFueraDeServicio(tipo: string): boolean {
  return (tipo ?? '').trim().toLowerCase() === TIPO_FUERA_DE_SERVICIO;
}

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
        tipoLabel: a.tipo,
        color: a.tipo_color ?? null,
        // Un asiento "Fuera de servicio" se muestra deshabilitado sin importar
        // su estado real en la función.
        estado: esFueraDeServicio(a.tipo)
          ? 'fuera_servicio'
          : mapEstado(a.estado, a.es_mio),
        version: 1,
      })),
    };
  }

  /**
   * Bloquea asientos de una función para el usuario actual
   * (POST /funciones/:id/asientos/bloquear). Propaga el 409 si alguno
   * ya no está disponible, para que el componente muestre el conflicto.
   */
  bloquear(
    idFuncion: string | number,
    ids: (string | number)[],
  ): Observable<ResultadoBloqueo> {
    const body = { ids_asiento_funcion: ids.map((id) => toStr(id)) };
    return this.http
      .post<BackendBloqueoResp>(`${this.base}/${idFuncion}/asientos/bloquear`, body)
      .pipe(
        map((res) => ({
          bloqueados: (res.bloqueados ?? []).map((id) => toStr(id)),
          expira_en: res.bloqueado_hasta,
        })),
      );
  }
}
