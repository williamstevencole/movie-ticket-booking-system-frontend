import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, of, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr, toStrOrNull, toNumOrNull } from '../../core/api/normalize';

export type FichaTecnica = {
  direccion?: string;
  guion?: string;
  fotografia?: string;
  reparto?: string[];
  musica?: string;
  pais?: string;
  productora?: string;
  distribuidor?: string;
  atributos?: Array<{ label: string; value: string }>;
};

export type Pelicula = {
  id: string;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno: string;
  id_genero: string | null;
  id_idioma: string;
  poster_url: string | null;
  activo: boolean;
  funciones_programadas: number;
  boletos_vendidos: number;
  created_at: string;
  tagline?: string;
  ficha_tecnica?: FichaTecnica;
  rating_promedio?: number | null;
  rating_count: number;
  mi_calificacion?: number | null;
  puede_reservar?: boolean;
};

export type CrearPeliculaInput = {
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno: string;
  id_genero: string | null;
  id_idioma: string;
  poster_url?: string | null;
  activo?: boolean;
  tagline?: string;
  ficha_tecnica?: FichaTecnica;
};

export type EditarPeliculaInput = Partial<CrearPeliculaInput>;

export type ListPeliculasQuery = {
  page?: number;
  limit?: number;
  titulo?: string;
  genero?: string;
  idioma?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ciudad_id?: string;
};

export type PeliculasPage = {
  data: Pelicula[];
  total: number;
  page: number;
  limit: number;
};

type BackendPelicula = Omit<Pelicula, 'funciones_programadas' | 'boletos_vendidos' | 'rating_count' | 'id_genero' | 'id_idioma'> & {
  id: string | number;
  id_genero: string | number | null;
  id_idioma: string | number | null;
  funciones_programadas?: number;
  boletos_vendidos?: number;
  rating_count?: number;
};

function mapBackendPelicula(p: BackendPelicula): Pelicula {
  return {
    id: toStr(p.id),
    titulo: p.titulo,
    sinopsis: p.sinopsis ?? '',
    duracion_min: p.duracion_min ?? 0,
    fecha_estreno: p.fecha_estreno,
    id_genero: toStrOrNull(p.id_genero),
    id_idioma: p.id_idioma == null ? '' : toStr(p.id_idioma),
    poster_url: p.poster_url ?? null,
    activo: p.activo,
    funciones_programadas: p.funciones_programadas ?? 0,
    boletos_vendidos: p.boletos_vendidos ?? 0,
    created_at: toStr(p.created_at),
    tagline: p.tagline,
    ficha_tecnica: p.ficha_tecnica as FichaTecnica | undefined,
    rating_promedio: toNumOrNull(p.rating_promedio),
    rating_count: p.rating_count ?? 0,
    mi_calificacion: p.mi_calificacion ?? null,
    puede_reservar: p.puede_reservar,
  };
}

@Injectable({ providedIn: 'root' })
export class PeliculasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/peliculas`;

  list(q: ListPeliculasQuery = {}): Observable<PeliculasPage> {
    let params = new HttpParams();
    if (q.page) params = params.set('page', String(q.page));
    if (q.limit) params = params.set('limit', String(q.limit));
    if (q.titulo && q.titulo.trim()) params = params.set('titulo', q.titulo.trim());
    if (q.genero) params = params.set('genero', q.genero);
    if (q.idioma) params = params.set('idioma', q.idioma);
    if (q.fecha_inicio) params = params.set('fecha_inicio', q.fecha_inicio);
    if (q.fecha_fin) params = params.set('fecha_fin', q.fecha_fin);
    if (q.ciudad_id) params = params.set('ciudad_id', q.ciudad_id);
    return this.http
      .get<{ data: BackendPelicula[]; total: number; page: number; limit: number }>(this.base, { params })
      .pipe(
        map((res) => ({
          data: res.data.map(mapBackendPelicula),
          total: res.total,
          page: res.page,
          limit: res.limit,
        })),
      );
  }

  getById(id: string): Observable<Pelicula> {
    return this.http
      .get<BackendPelicula>(`${this.base}/${id}`)
      .pipe(map(mapBackendPelicula));
  }

  create(input: CrearPeliculaInput): Observable<Pelicula> {
    return this.http
      .post<BackendPelicula>(this.base, this.toBackendInput(input))
      .pipe(map(mapBackendPelicula));
  }

  update(id: string, input: EditarPeliculaInput): Observable<Pelicula> {
    return this.http
      .patch<BackendPelicula>(`${this.base}/${id}`, this.toBackendInput(input))
      .pipe(map(mapBackendPelicula));
  }

  toggleActivo(id: string, activo: boolean): Observable<Pelicula> {
    const body: components['schemas']['SetActivoPeliculaDto'] = { activo };
    return this.http
      .patch<BackendPelicula>(`${this.base}/${id}/activo`, body)
      .pipe(map(mapBackendPelicula));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Sube un archivo de imagen como poster. Devuelve la URL final de Cloudinary. */
  uploadPoster(id: string, file: File): Observable<{ id: string; poster_url: string | null }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: string | number; poster_url: string | null }>(
      `${this.base}/${id}/poster`,
      form,
    ).pipe(
      map((res) => ({ id: String(res.id), poster_url: res.poster_url ?? null })),
    );
  }

  /**
   * Variante de `create` que adicionalmente sube el poster cuando el form provee un File.
   * Si `posterFile` es null, equivale a `create`.
   */
  createWithPoster(input: CrearPeliculaInput, posterFile: File | null): Observable<Pelicula> {
    return this.create(input).pipe(
      switchMap((p) =>
        posterFile
          ? this.uploadPoster(p.id, posterFile).pipe(
              map((res) => ({ ...p, poster_url: res.poster_url })),
            )
          : of(p),
      ),
    );
  }

  /** Variante de `update` que también sube poster si vino archivo. */
  updateWithPoster(id: string, input: EditarPeliculaInput, posterFile: File | null): Observable<Pelicula> {
    return this.update(id, input).pipe(
      switchMap((p) =>
        posterFile
          ? this.uploadPoster(p.id, posterFile).pipe(
              map((res) => ({ ...p, poster_url: res.poster_url })),
            )
          : of(p),
      ),
    );
  }

  /** No-op kept for compatibility with CalificacionesService callers (mocked path). */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aplicarRatingActualizado(_id: string, _ratingPromedio: number | null, _ratingCount: number): void {
    // server-driven now; no-op
  }

  private toBackendInput(input: EditarPeliculaInput): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input };
    // Backend uses `id_genero` already; nothing to remap there.
    // Drop fields the DTO does not accept and let undefined pass through.
    return out;
  }
}
