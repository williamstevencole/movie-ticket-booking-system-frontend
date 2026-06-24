import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_PELICULAS } from '../../mocks/data/peliculas.mock';

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
  id_generos: string[];
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
};

export type CrearPeliculaInput = {
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno: string;
  id_generos: string[];
  id_idioma: string;
  poster_url: string | null;
  activo?: boolean;
  tagline?: string;
  ficha_tecnica?: FichaTecnica;
};

export type EditarPeliculaInput = Partial<CrearPeliculaInput>;

@Injectable({ providedIn: 'root' })
export class PeliculasService {
  list(): Observable<Pelicula[]> {
    return of([...MOCK_PELICULAS]).pipe(delay(120));
  }

  getById(id: string): Observable<Pelicula> {
    const found = MOCK_PELICULAS.find((p) => p.id === id) ?? MOCK_PELICULAS[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  create(input: CrearPeliculaInput): Observable<Pelicula> {
    const nueva: Pelicula = {
      id: `p-new-${Date.now()}`,
      titulo: input.titulo,
      sinopsis: input.sinopsis,
      duracion_min: input.duracion_min,
      fecha_estreno: input.fecha_estreno,
      id_generos: input.id_generos,
      id_idioma: input.id_idioma,
      poster_url: input.poster_url,
      activo: input.activo ?? true,
      funciones_programadas: 0,
      boletos_vendidos: 0,
      created_at: new Date().toISOString(),
      tagline: input.tagline,
      ficha_tecnica: input.ficha_tecnica,
      rating_promedio: null,
      rating_count: 0,
    };
    return of({ ...nueva }).pipe(delay(120));
  }

  update(id: string, input: EditarPeliculaInput): Observable<Pelicula> {
    const found = MOCK_PELICULAS.find((p) => p.id === id) ?? MOCK_PELICULAS[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  /** PATCH /api/peliculas/:id/activo — explicit activo boolean */
  toggleActivo(id: string, activo: boolean): Observable<Pelicula> {
    const found = MOCK_PELICULAS.find((p) => p.id === id) ?? MOCK_PELICULAS[0]!;
    return of({ ...found, activo }).pipe(delay(120));
  }

  delete(id: string): Observable<void> {
    return of(undefined as void).pipe(delay(120));
  }

  /**
   * Aplica los nuevos valores de rating tras un voto/borrado en CalificacionesService.
   * En la implementación mock esto es un no-op (datos locales no mutados).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aplicarRatingActualizado(_idPelicula: string, _ratingPromedio: number | null, _ratingCount: number): void {
    // no-op for mock implementation
  }
}
