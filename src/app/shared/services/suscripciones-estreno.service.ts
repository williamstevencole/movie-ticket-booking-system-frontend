import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_URL } from '../../core/config/env';

@Injectable({ providedIn: 'root' })
export class SuscripcionesEstrenoService {
  private readonly http = inject(HttpClient);
  readonly _subscritas = signal<Set<string>>(new Set());

  readonly subscritas = this._subscritas.asReadonly();
  readonly totalSeguidas = computed(() => this._subscritas().size);

  estaSuscrito(idPelicula: string): boolean {
    return this._subscritas().has(idPelicula);
  }

  hydrate(): Observable<void> {
    return this.http.get<string[]>(`${API_URL}/me/suscripciones-estreno`).pipe(
      tap((ids) => this._subscritas.set(new Set(ids))),
      map(() => undefined),
    );
  }

  reset(): void {
    this._subscritas.set(new Set());
  }

  subscribe(idPelicula: string): Observable<void> {
    const prev = new Set(this._subscritas());
    const next = new Set(this._subscritas());
    next.add(idPelicula);
    this._subscritas.set(next);
    return this.http.post<{ subscribed: boolean }>(`${API_URL}/peliculas/${idPelicula}/suscripcion-estreno`, {}).pipe(
      map(() => undefined),
      catchError((err) => {
        this._subscritas.set(prev);
        return throwError(() => err);
      }),
    );
  }

  unsubscribe(idPelicula: string): Observable<void> {
    const prev = new Set(this._subscritas());
    const next = new Set(this._subscritas());
    next.delete(idPelicula);
    this._subscritas.set(next);
    return this.http.delete<{ subscribed: boolean }>(`${API_URL}/peliculas/${idPelicula}/suscripcion-estreno`).pipe(
      map(() => undefined),
      catchError((err) => {
        this._subscritas.set(prev);
        return throwError(() => err);
      }),
    );
  }
}
