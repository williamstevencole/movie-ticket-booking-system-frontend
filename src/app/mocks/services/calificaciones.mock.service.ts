import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, delay, switchMap } from 'rxjs';
import { CalificacionesService, ResultadoCalificacion } from '../../shared/services/calificaciones.service';
import { PeliculasService } from '../../shared/services/peliculas.service';

@Injectable()
export class MockCalificacionesService extends CalificacionesService {
  private votos = new Map<string, number>();
  private readonly idUsuario = '2';
  private readonly peliculas = inject(PeliculasService);

  override obtenerMia(idPelicula: string): Observable<{ puntuacion: number } | null> {
    const v = this.votos.get(this.key(idPelicula));
    return of(v == null ? null : { puntuacion: v }).pipe(delay(60));
  }

  override calificar(idPelicula: string, puntuacion: number): Observable<ResultadoCalificacion> {
    if (puntuacion < 1 || puntuacion > 5) {
      return throwError(() => new Error('Rango inválido'));
    }
    return this.peliculas.getById(idPelicula).pipe(
      switchMap((peli) => {
        const key = this.key(idPelicula);
        const votoAnterior = this.votos.get(key);
        this.votos.set(key, puntuacion);

        const prevCount = peli.rating_count ?? 0;
        const prevSum = (peli.rating_promedio ?? 0) * prevCount;
        let newCount = prevCount;
        let newSum = prevSum;

        if (votoAnterior == null) {
          newCount = prevCount + 1;
          newSum = prevSum + puntuacion;
        } else {
          newSum = prevSum - votoAnterior + puntuacion;
        }

        const newAvg = newCount === 0 ? null : Number((newSum / newCount).toFixed(2));
        this.peliculas.aplicarRatingActualizado(idPelicula, newAvg, newCount);

        return of<ResultadoCalificacion>({
          puntuacion,
          rating_promedio: newAvg,
          rating_count: newCount,
        }).pipe(delay(80));
      }),
    );
  }

  override borrar(idPelicula: string): Observable<ResultadoCalificacion> {
    return this.peliculas.getById(idPelicula).pipe(
      switchMap((peli) => {
        const key = this.key(idPelicula);
        const votoAnterior = this.votos.get(key);
        this.votos.delete(key);

        const prevCount = peli.rating_count ?? 0;
        const prevSum = (peli.rating_promedio ?? 0) * prevCount;
        let newCount = prevCount;
        let newSum = prevSum;

        if (votoAnterior != null) {
          newSum = prevSum - votoAnterior;
          newCount = Math.max(prevCount - 1, 0);
        }

        const newAvg = newCount === 0 ? null : Number((newSum / newCount).toFixed(2));
        this.peliculas.aplicarRatingActualizado(idPelicula, newAvg, newCount);

        return of<ResultadoCalificacion>({
          rating_promedio: newAvg,
          rating_count: newCount,
        }).pipe(delay(80));
      }),
    );
  }

  private key(idPelicula: string): string {
    return `${idPelicula}:${this.idUsuario}`;
  }
}
