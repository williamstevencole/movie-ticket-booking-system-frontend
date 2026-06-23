import { Observable } from 'rxjs';

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

export abstract class PeliculasService {
  abstract list(): Observable<Pelicula[]>;
  abstract getById(id: string): Observable<Pelicula>;
  abstract create(input: CrearPeliculaInput): Observable<Pelicula>;
  abstract update(id: string, input: EditarPeliculaInput): Observable<Pelicula>;
  abstract toggleActivo(id: string): Observable<Pelicula>;
  abstract delete(id: string): Observable<void>;

  /**
   * Aplica los nuevos valores de rating tras un voto/borrado en CalificacionesService.
   * El backend ya los recalcula vía trigger; este método solo refresca el estado local
   * (cache, store en memoria) para que cartelera/mis-boletos vean el cambio sin refetch.
   */
  abstract aplicarRatingActualizado(idPelicula: string, ratingPromedio: number | null, ratingCount: number): void;
}
