import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CIUDADES } from '../../mocks/data/ciudades.mock';

export type Ciudad = {
  id: string;
  nombre: string;
  created_at: string;
};

export type CrearCiudadInput = {
  nombre: string;
};

export type EditarCiudadInput = {
  nombre?: string;
};

const ciudades: Ciudad[] = [...MOCK_CIUDADES];

@Injectable({ providedIn: 'root' })
export class CiudadesService {
  list(): Observable<Ciudad[]> {
    return of([...ciudades]).pipe(delay(120));
  }

  create(input: CrearCiudadInput): Observable<Ciudad> {
    const nueva: Ciudad = {
      id: String(Date.now()),
      nombre: input.nombre,
      created_at: new Date().toISOString(),
    };
    return of({ ...nueva }).pipe(delay(120));
  }

  update(id: string | number, input: EditarCiudadInput): Observable<Ciudad> {
    const found = ciudades.find((c) => c.id === String(id)) ?? ciudades[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  delete(id: string | number): Observable<void> {
    return of(undefined as void).pipe(delay(120));
  }
}
