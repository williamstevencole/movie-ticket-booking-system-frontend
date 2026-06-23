import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearPeliculaInput,
  EditarPeliculaInput,
  Pelicula,
  PeliculasService,
} from '../../shared/services/peliculas.service';
import { MOCK_PELICULAS } from '../data/peliculas.mock';

@Injectable()
export class MockPeliculasService extends PeliculasService {
  private store: Pelicula[] = MOCK_PELICULAS.map((p) => ({ ...p }));

  override aplicarRatingActualizado(idPelicula: string, ratingPromedio: number | null, ratingCount: number): void {
    const peli = this.store.find((x) => x.id === idPelicula);
    if (!peli) return;
    peli.rating_promedio = ratingPromedio;
    peli.rating_count = ratingCount;
  }

  override list(): Observable<Pelicula[]> {
    return of(
      [...this.store].sort(
        (a, b) =>
          new Date(b.fecha_estreno).getTime() -
          new Date(a.fecha_estreno).getTime(),
      ),
    );
  }

  override getById(id: string): Observable<Pelicula> {
    const p = this.store.find((x) => x.id === id);
    if (!p) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Película no encontrada' }));
    }
    return of({ ...p });
  }

  override create(input: CrearPeliculaInput): Observable<Pelicula> {
    const titulo = input.titulo.trim();
    if (!titulo) {
      return throwError(() => ({ code: 'EMPTY', message: 'El título no puede estar vacío' }));
    }
    if (this.existsByTitulo(titulo)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe una película con ese título' }));
    }
    const pelicula: Pelicula = {
      id: this.nextId(),
      titulo,
      sinopsis: input.sinopsis.trim(),
      duracion_min: input.duracion_min,
      fecha_estreno: input.fecha_estreno,
      id_generos: [...input.id_generos],
      id_idioma: input.id_idioma,
      poster_url: input.poster_url,
      activo: input.activo ?? true,
      tagline: input.tagline,
      ficha_tecnica: input.ficha_tecnica,
      funciones_programadas: 0,
      boletos_vendidos: 0,
      rating_count: 0,
      rating_promedio: null,
      created_at: new Date().toISOString(),
    };
    this.store.push(pelicula);
    return of({ ...pelicula });
  }

  override update(id: string, input: EditarPeliculaInput): Observable<Pelicula> {
    const idx = this.store.findIndex((x) => x.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Película no encontrada' }));
    }
    const titulo = input.titulo?.trim();
    if (titulo !== undefined) {
      if (!titulo) {
        return throwError(() => ({ code: 'EMPTY', message: 'El título no puede estar vacío' }));
      }
      if (this.existsByTitulo(titulo, id)) {
        return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe una película con ese título' }));
      }
    }
    const current = this.store[idx]!;
    const next: Pelicula = {
      ...current,
      ...input,
      titulo: titulo ?? current.titulo,
      sinopsis: input.sinopsis !== undefined ? input.sinopsis.trim() : current.sinopsis,
      id_generos: input.id_generos ? [...input.id_generos] : current.id_generos,
    };
    this.store[idx] = next;
    return of({ ...next });
  }

  override toggleActivo(id: string): Observable<Pelicula> {
    const idx = this.store.findIndex((x) => x.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Película no encontrada' }));
    }
    const current = this.store[idx]!;
    const next: Pelicula = {
      ...current,
      activo: !current.activo,
    };
    this.store[idx] = next;
    return of({ ...next });
  }

  override delete(id: string): Observable<void> {
    const idx = this.store.findIndex((x) => x.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Película no encontrada' }));
    }
    const current = this.store[idx]!;
    if (current.funciones_programadas > 0) {
      return throwError(() => ({
        code: 'HAS_RELATIONS',
        message: `No se puede eliminar: ${current.funciones_programadas} función(es) programada(s)`,
      }));
    }
    this.store.splice(idx, 1);
    return of(void 0);
  }

  private existsByTitulo(titulo: string, ignoreId?: string): boolean {
    const needle = titulo.toLowerCase();
    return this.store.some(
      (p) => p.titulo.toLowerCase() === needle && p.id !== ignoreId,
    );
  }

  private nextId(): string {
    const maxNum = this.store
      .map((p) => Number(p.id.replace(/^p-/, '')))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `p-${maxNum + 1}`;
  }
}
