import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Cine,
  CinesPage,
  CinesService,
  CrearCineInput,
  EditarCineInput,
  ListCinesQuery,
} from '../../shared/services/cines.service';
import { MOCK_CINES } from '../data/cines.mock';

@Injectable()
export class MockCinesService extends CinesService {
  private store: Cine[] = MOCK_CINES.map((c) => ({ ...c }));

  override list(query?: ListCinesQuery): Observable<CinesPage> {
    let data = this.store;

    if (query?.id_ciudad !== undefined && query.id_ciudad !== null) {
      const id = String(query.id_ciudad);
      data = data.filter((c) => c.id_ciudad === id);
    }
    if (query?.name) {
      const needle = query.name.toLowerCase();
      data = data.filter((c) => c.nombre.toLowerCase().includes(needle));
    }

    return of({
      data: data.map((c) => ({ ...c })),
      total: data.length,
      page: query?.page ?? 1,
      limit: query?.limit ?? data.length,
    });
  }

  override getById(id: string): Observable<Cine> {
    const cine = this.store.find((c) => c.id === id);
    if (!cine) {
      return throwError(() => ({ status: 404, error: { message: 'Cine no encontrado' } }));
    }
    return of({ ...cine });
  }

  override create(input: CrearCineInput): Observable<Cine> {
    const nombre = input.nombre.trim();
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    if (!input.id_ciudad) {
      return throwError(() => ({ code: 'NO_CITY', message: 'Selecciona una ciudad' }));
    }
    if (this.existsByNombre(nombre, input.id_ciudad)) {
      return throwError(() => ({
        code: 'DUPLICATE',
        message: 'Ya existe un cine con ese nombre en esa ciudad',
      }));
    }
    const cine: Cine = {
      id: this.nextId(),
      nombre,
      id_ciudad: input.id_ciudad,
      direccion: input.direccion?.trim() || null,
      salas: [],
      fecha_creacion: new Date().toISOString(),
    };
    this.store.push(cine);
    return of({ ...cine });
  }

  override update(id: string, input: EditarCineInput): Observable<Cine> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Cine no encontrado' }));
    }
    const current = this.store[idx]!;
    const nombre = input.nombre !== undefined ? input.nombre.trim() : current.nombre;
    if (!nombre) {
      return throwError(() => ({ code: 'EMPTY', message: 'El nombre no puede estar vacío' }));
    }
    const id_ciudad = input.id_ciudad ?? current.id_ciudad;
    if (this.existsByNombre(nombre, id_ciudad, id)) {
      return throwError(() => ({
        code: 'DUPLICATE',
        message: 'Ya existe un cine con ese nombre en esa ciudad',
      }));
    }
    const next: Cine = {
      ...current,
      nombre,
      id_ciudad,
      direccion:
        input.direccion !== undefined
          ? input.direccion?.trim() || null
          : current.direccion,
    };
    this.store[idx] = next;
    return of({ ...next });
  }

  private existsByNombre(nombre: string, idCiudad: string, ignoreId?: string): boolean {
    const needle = nombre.toLowerCase();
    return this.store.some(
      (c) =>
        c.id_ciudad === idCiudad &&
        c.nombre.toLowerCase() === needle &&
        c.id !== ignoreId,
    );
  }

  private nextId(): string {
    return `cine-${Date.now().toString(36)}`;
  }
}
