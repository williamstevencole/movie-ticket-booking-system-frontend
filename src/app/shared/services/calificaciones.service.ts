import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type ResultadoCalificacion = {
  puntuacion?: number;       // ausente si DELETE
  rating_promedio: number | null;
  rating_count: number;
};

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  /** Devuelve { puntuacion } o null si no votó. */
  obtenerMia(idPelicula: string) {
    // Mock: usuario no ha calificado ninguna película
    return of(null as { puntuacion: number } | null).pipe(delay(120));
  }

  calificar(idPelicula: string, puntuacion: number) {
    const result: ResultadoCalificacion = {
      puntuacion,
      rating_promedio: puntuacion,
      rating_count: 1,
    };
    return of(result).pipe(delay(120));
  }

  borrar(idPelicula: string) {
    const result: ResultadoCalificacion = {
      rating_promedio: null,
      rating_count: 0,
    };
    return of(result).pipe(delay(120));
  }
}
