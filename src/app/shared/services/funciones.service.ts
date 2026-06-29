import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type EstadoFuncion =
  | 'programada'
  | 'en_curso'
  | 'finalizada'
  | 'cancelada';

export type Funcion = {
  id: string;
  id_pelicula: string;
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
  estado: EstadoFuncion;
  boletos_vendidos: number;
  created_at: string;
};

export type CrearFuncionInput = {
  id_pelicula: string;
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
};

export type EditarFuncionInput = Partial<Omit<CrearFuncionInput, 'id_cine'>>;

export type ConflictoFuncion = {
  id: string;
  fecha_hora: string;
  fecha_hora_fin: string;
  pelicula: { titulo: string };
};

export type CheckConflictosParams = {
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
  duracion_min: number;
  ignorar_id?: string;
};

export interface AdminAsientoMapaItem {
  idAsientoFuncion: string;
  fila: string;
  columna: number;
  codigo: string;
  tipo: string;
  color: string | null;
  estado: 'disponible' | 'bloqueado' | 'reservado' | 'ocupado';
  precio: number;
  usuario: { id: string; email: string } | null;
  bloqueadoHasta: string | null;
}

export interface AdminMapaAsientos {
  funcionId: string;
  sala: { filas: number; columnas: number };
  asientos: AdminAsientoMapaItem[];
}

interface BackendAdminAsientoItem {
  id_asiento_funcion: string;
  fila: string;
  columna: number;
  codigo: string;
  tipo: string;
  color: string | null;
  estado: 'disponible' | 'bloqueado' | 'reservado' | 'ocupado';
  precio: number;
  usuario: { id: string; email: string } | null;
  bloqueado_hasta: string | null;
}

interface BackendAdminMapa {
  funcion_id: string;
  sala: { filas: number; columnas: number };
  asientos: BackendAdminAsientoItem[];
}

type BackendFuncionBase = {
  id: string | number;
  id_pelicula: string | number;
  id_sala: string | number;
  fecha_hora: string;
  estado: string;
  created_at: string;
};

type BackendFuncion = BackendFuncionBase & {
  salas?: { id_cine: string | number } | null;
};

function mapBackendFuncion(f: BackendFuncion): Funcion {
  return {
    id: toStr(f.id),
    id_pelicula: toStr(f.id_pelicula),
    id_cine: f.salas ? toStr(f.salas.id_cine) : '',
    id_sala: toStr(f.id_sala),
    fecha_hora: f.fecha_hora,
    estado: f.estado as EstadoFuncion,
    boletos_vendidos: 0,
    created_at: f.created_at,
  };
}

type BackendConflicto = {
  id: string | number;
  fecha_hora: string;
  fecha_hora_fin: string;
  pelicula: { titulo: string };
};

function mapBackendConflicto(c: BackendConflicto): ConflictoFuncion {
  return {
    id: toStr(c.id),
    fecha_hora: c.fecha_hora,
    fecha_hora_fin: c.fecha_hora_fin,
    pelicula: { titulo: c.pelicula.titulo },
  };
}

@Injectable({ providedIn: 'root' })
export class FuncionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/funciones`;
  private readonly adminBase = `${API_URL}/admin/funciones`;

  list(): Observable<Funcion[]> {
    return this.http
      .get<BackendFuncion[]>(this.base)
      .pipe(map((arr) => arr.map(mapBackendFuncion)));
  }

  getById(id: string): Observable<Funcion> {
    return this.http
      .get<BackendFuncion>(`${this.base}/${id}`)
      .pipe(map(mapBackendFuncion));
  }

  create(input: CrearFuncionInput): Observable<Funcion> {
    const body: components['schemas']['CreateFuncionDto'] = {
      id_pelicula: input.id_pelicula,
      id_sala: input.id_sala,
      fecha_hora: input.fecha_hora,
      estado: 'programada',
    };
    return this.http
      .post<BackendFuncion>(this.base, body)
      .pipe(map(mapBackendFuncion));
  }

  update(id: string, input: EditarFuncionInput): Observable<Funcion> {
    // El backend solo admite estos campos (id_cine es solo del UI para
    // filtrar las salas, y su DTO lo rechaza con forbidNonWhitelisted).
    const body: Partial<components['schemas']['CreateFuncionDto']> = {};
    if (input.id_pelicula !== undefined) body.id_pelicula = input.id_pelicula;
    if (input.id_sala !== undefined) body.id_sala = input.id_sala;
    if (input.fecha_hora !== undefined) body.fecha_hora = input.fecha_hora;
    return this.http
      .patch<BackendFuncion>(`${this.base}/${id}`, body)
      .pipe(map(mapBackendFuncion));
  }

  cancelar(id: string): Observable<Funcion> {
    return this.http
      .patch<BackendFuncion>(`${this.base}/${id}/cancelar`, {})
      .pipe(map(mapBackendFuncion));
  }

  checkConflictos(params: CheckConflictosParams): Observable<ConflictoFuncion[]> {
    let httpParams = new HttpParams()
      .set('id_cine', params.id_cine)
      .set('id_sala', params.id_sala)
      .set('fecha_hora', params.fecha_hora)
      .set('duracion_min', String(params.duracion_min));
    if (params.ignorar_id) {
      httpParams = httpParams.set('ignorar_id', params.ignorar_id);
    }
    return this.http
      .get<BackendConflicto[]>(`${this.adminBase}/conflictos`, {
        params: httpParams,
      })
      .pipe(map((arr) => arr.map(mapBackendConflicto)));
  }

  mapaAdmin(id: string): Observable<AdminMapaAsientos> {
    return this.http.get<BackendAdminMapa>(`${this.adminBase}/${id}/asientos`).pipe(
      map((b) => ({
        funcionId: b.funcion_id,
        sala: b.sala,
        asientos: b.asientos.map((a) => ({
          idAsientoFuncion: a.id_asiento_funcion,
          fila: a.fila,
          columna: a.columna,
          codigo: a.codigo,
          tipo: a.tipo,
          color: a.color,
          estado: a.estado,
          precio: a.precio,
          usuario: a.usuario,
          bloqueadoHasta: a.bloqueado_hasta,
        })),
      })),
    );
  }
}
