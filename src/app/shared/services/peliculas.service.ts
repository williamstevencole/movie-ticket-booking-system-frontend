import { Observable } from 'rxjs';

export type Clasificacion = 'A' | 'PG' | 'PG-13' | 'R' | 'NC-17';
export type EstadoPelicula = 'activa' | 'inactiva';

export type Pelicula = {
  id: string;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno: string;
  id_generos: string[];
  id_idioma: string;
  clasificacion: Clasificacion;
  poster_url: string | null;
  estado: EstadoPelicula;
  funciones_programadas: number;
  boletos_vendidos: number;
  created_at: string;
};

export type CrearPeliculaInput = {
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno: string;
  id_generos: string[];
  id_idioma: string;
  clasificacion: Clasificacion;
  poster_url: string | null;
  estado?: EstadoPelicula;
};

export type EditarPeliculaInput = Partial<CrearPeliculaInput>;

export abstract class PeliculasService {
  abstract list(): Observable<Pelicula[]>;
  abstract getById(id: string): Observable<Pelicula>;
  abstract create(input: CrearPeliculaInput): Observable<Pelicula>;
  abstract update(id: string, input: EditarPeliculaInput): Observable<Pelicula>;
  abstract toggleEstado(id: string): Observable<Pelicula>;
  abstract delete(id: string): Observable<void>;
}
