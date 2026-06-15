import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Ciudad,
  CiudadesService,
  CrearCiudadInput,
  EditarCiudadInput,
} from '../../shared/services/ciudades.service';
import { MOCK_CIUDADES } from '../data/ciudades.mock';
import { MOCK_CINES } from '../data/cines.mock';

@Injectable()
export class MockCiudadesService extends CiudadesService {
  private store: Ciudad[] = [...MOCK_CIUDADES];

  override list(): Observable<Ciudad[]> {
    return of([...this.store].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  override create(input: CrearCiudadInput): Observable<Ciudad> {
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe una ciudad con ese nombre' }));
    }
    const ciudad: Ciudad = {
      id: this.nextId(),
      nombre,
      created_at: new Date().toISOString(),
    };
    this.store.push(ciudad);
    return of(ciudad);
  }

  override update(id: string, input: EditarCiudadInput): Observable<Ciudad> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Ciudad no encontrada' }));
    }
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre, id)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe una ciudad con ese nombre' }));
    }
    const next: Ciudad = { ...this.store[idx]!, nombre };
    this.store[idx] = next;
    return of(next);
  }

  override delete(id: string): Observable<void> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Ciudad no encontrada' }));
    }
    const cinesAsociados = MOCK_CINES.filter((c) => c.id_ciudad === id).length;
    if (cinesAsociados > 0) {
      return throwError(() => ({
        code: 'HAS_RELATIONS',
        message: `No se puede eliminar: ${cinesAsociados} cine(s) asociado(s) a esta ciudad`,
      }));
    }
    this.store.splice(idx, 1);
    return of(void 0);
  }

  private existsByNombre(nombre: string, ignoreId?: string): boolean {
    const needle = nombre.toLowerCase();
    return this.store.some(
      (c) => c.nombre.toLowerCase() === needle && c.id !== ignoreId,
    );
  }

  private nextId(): string {
    const maxNum = this.store
      .map((c) => Number(c.id))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return String(maxNum + 1);
  }
}
