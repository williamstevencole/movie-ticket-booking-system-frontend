import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearTipoAsientoInput,
  EditarTipoAsientoInput,
  TipoAsiento,
  TiposAsientoService,
} from '../../shared/services/tipos-asiento.service';
import { MOCK_TIPOS_ASIENTO } from '../data/tipos-asiento.mock';

@Injectable()
export class MockTiposAsientoService extends TiposAsientoService {
  private store: TipoAsiento[] = MOCK_TIPOS_ASIENTO.map((t) => ({ ...t }));

  override list(): Observable<TipoAsiento[]> {
    return of(this.store.map((t) => ({ ...t })));
  }

  override create(input: CrearTipoAsientoInput): Observable<TipoAsiento> {
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un tipo con ese nombre' }));
    }
    const tipo: TipoAsiento = {
      id: `tip-${Date.now().toString(36)}`,
      nombre,
      color: input.color,
      activo: true,
      salas_usando: 0,
      asientos_total: 0,
      created_at: new Date().toISOString(),
    };
    this.store = [...this.store, tipo];
    return of({ ...tipo });
  }

  override update(
    id: string,
    input: EditarTipoAsientoInput,
  ): Observable<TipoAsiento> {
    const idx = this.store.findIndex((t) => t.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Tipo no encontrado' }));
    }
    const current = this.store[idx]!;
    const nombre = input.nombre !== undefined ? input.nombre.trim() : current.nombre;
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (this.existsByNombre(nombre, id)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un tipo con ese nombre' }));
    }
    const next: TipoAsiento = {
      ...current,
      nombre,
      color: input.color ?? current.color,
    };
    this.store[idx] = next;
    return of({ ...next });
  }

  override setActivo(id: string, activo: boolean): Observable<TipoAsiento> {
    const idx = this.store.findIndex((t) => t.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Tipo no encontrado' }));
    }
    const next: TipoAsiento = { ...this.store[idx]!, activo };
    this.store[idx] = next;
    return of({ ...next });
  }

  override remove(id: string): Observable<void> {
    const idx = this.store.findIndex((t) => t.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Tipo no encontrado' }));
    }
    if (this.store[idx]!.asientos_total > 0) {
      return throwError(() => ({
        code: 'IN_USE',
        message: 'No se puede eliminar un tipo asignado a asientos existentes',
      }));
    }
    this.store = [...this.store.slice(0, idx), ...this.store.slice(idx + 1)];
    return of(void 0);
  }

  private existsByNombre(nombre: string, ignoreId?: string): boolean {
    const needle = nombre.toLowerCase();
    return this.store.some(
      (t) => t.nombre.toLowerCase() === needle && t.id !== ignoreId,
    );
  }
}
