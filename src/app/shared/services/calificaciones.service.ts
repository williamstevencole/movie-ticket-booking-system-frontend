import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type CalificacionMia = {
  elegible: boolean;
  puntuacion: number | null;
};

export type ResultadoCalificacion = {
  puntuacion?: number;
  rating_promedio: number | null;
  rating_count: number;
};

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/peliculas';

  obtenerMia(idPelicula: string): Observable<CalificacionMia> {
    return this.http.get<CalificacionMia>(`${this.base}/${idPelicula}/calificacion-mia`);
  }

  calificar(idPelicula: string, puntuacion: number): Observable<ResultadoCalificacion> {
    return this.http.patch<ResultadoCalificacion>(
      `${this.base}/${idPelicula}/calificacion`,
      { puntuacion },
    );
  }

  borrar(idPelicula: string): Observable<ResultadoCalificacion> {
    return this.http.delete<ResultadoCalificacion>(
      `${this.base}/${idPelicula}/calificacion`,
    );
  }
}
