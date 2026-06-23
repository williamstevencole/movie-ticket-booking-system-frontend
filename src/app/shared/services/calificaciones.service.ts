import { Observable } from 'rxjs';

export type ResultadoCalificacion = {
  puntuacion?: number;       // ausente si DELETE
  rating_promedio: number | null;
  rating_count: number;
};

export abstract class CalificacionesService {
  /** Devuelve { puntuacion } o null si no votó. */
  abstract obtenerMia(idPelicula: string): Observable<{ puntuacion: number } | null>;
  abstract calificar(idPelicula: string, puntuacion: number): Observable<ResultadoCalificacion>;
  abstract borrar(idPelicula: string): Observable<ResultadoCalificacion>;
}
