import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearGeneroInput,
  EditarGeneroInput,
  Genero,
  GenerosService,
} from '../../shared/services/generos.service';
import { MOCK_GENEROS } from '../data/generos.mock';

@Injectable()
export class MockGenerosService extends GenerosService {
  private store: Genero[] = [...MOCK_GENEROS];

  override list(): Observable<Genero[]> {
    return of([...this.store].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  override create(input: CrearGeneroInput): Observable<Genero> {
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un género con ese nombre' }));
    }
    const genero: Genero = {
      id: this.nextId(),
      nombre,
    };
    this.store.push(genero);
    return of(genero);
  }

  override update(id: string, input: EditarGeneroInput): Observable<Genero> {
    const idx = this.store.findIndex((g) => g.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Género no encontrado' }));
    }
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre, id)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un género con ese nombre' }));
    }
    const next: Genero = { ...this.store[idx]!, nombre };
    this.store[idx] = next;
    return of(next);
  }

  override delete(id: string): Observable<void> {
    const idx = this.store.findIndex((g) => g.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Género no encontrado' }));
    }
    this.store.splice(idx, 1);
    return of(void 0);
  }

  private existsByNombre(nombre: string, ignoreId?: string): boolean {
    const needle = nombre.toLowerCase();
    return this.store.some(
      (g) => g.nombre.toLowerCase() === needle && g.id !== ignoreId,
    );
  }

  private nextId(): string {
    const maxNum = this.store
      .map((g) => Number(g.id.replace(/^g-/, '')))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `g-${maxNum + 1}`;
  }
}
