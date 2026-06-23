import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearIdiomaInput,
  EditarIdiomaInput,
  Idioma,
  IdiomasService,
} from '../../shared/services/idiomas.service';
import { MOCK_IDIOMAS } from '../data/idiomas.mock';

@Injectable()
export class MockIdiomasService extends IdiomasService {
  private store: Idioma[] = [...MOCK_IDIOMAS];

  override list(): Observable<Idioma[]> {
    return of([...this.store].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  override create(input: CrearIdiomaInput): Observable<Idioma> {
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre es obligatorio' }));
    }
    if (this.existsByNombre(nombre)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un idioma con ese nombre' }));
    }
    const idioma: Idioma = {
      id: this.nextId(),
      nombre,
    };
    this.store.push(idioma);
    return of(idioma);
  }

  override update(id: string, input: EditarIdiomaInput): Observable<Idioma> {
    const idx = this.store.findIndex((i) => i.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Idioma no encontrado' }));
    }
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre es obligatorio' }));
    }
    if (this.existsByNombre(nombre, id)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un idioma con ese nombre' }));
    }
    const next: Idioma = { ...this.store[idx]!, nombre };
    this.store[idx] = next;
    return of(next);
  }

  override delete(id: string): Observable<void> {
    const idx = this.store.findIndex((i) => i.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Idioma no encontrado' }));
    }
    this.store.splice(idx, 1);
    return of(void 0);
  }

  private existsByNombre(nombre: string, ignoreId?: string): boolean {
    const needle = nombre.toLowerCase();
    return this.store.some(
      (i) => i.nombre.toLowerCase() === needle && i.id !== ignoreId,
    );
  }

  private nextId(): string {
    const maxNum = this.store
      .map((i) => Number(i.id.replace(/^i-/, '')))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `i-${maxNum + 1}`;
  }
}
