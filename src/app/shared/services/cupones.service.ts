import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CUPONES } from '../../mocks/data/cupones.mock';

export type CuponTipo = 'porcentaje' | 'monto' | 'monto_fijo';

export type Cupon = {
  id: string;
  codigo: string;
  tipo: CuponTipo | string;
  valor: number | string;
  fecha_expiracion: string;
  usos_maximos: number | null;
  usos_actuales: number;
  activo: boolean;
  created_at: string;
  monto_descontado?: number;
  titulo?: string;
  descripcion?: string;
};

export type ValidarCuponResponse = {
  valido: boolean;
  cupon?: Cupon;
  mensaje?: string;
};

export type CrearCuponInput = {
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  fecha_expiracion: string;
  usos_maximos: number | null;
};

@Injectable({ providedIn: 'root' })
export class CuponesService {
  list(): Observable<Cupon[]> {
    return of([...MOCK_CUPONES]).pipe(delay(120));
  }

  getById(id: string): Observable<Cupon> {
    const found = MOCK_CUPONES.find((c) => c.id === id) ?? MOCK_CUPONES[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  validar(codigo: string): Observable<ValidarCuponResponse> {
    const found = MOCK_CUPONES.find((c) => c.codigo === codigo && c.activo);
    if (found) {
      return of({ valido: true, cupon: { ...found } }).pipe(delay(120));
    }
    return of({ valido: false, mensaje: 'Cupón no válido o inactivo.' }).pipe(delay(120));
  }

  create(input: CrearCuponInput): Observable<Cupon> {
    const nuevo: Cupon = {
      id: `cup-${Date.now()}`,
      codigo: input.codigo,
      tipo: input.tipo,
      valor: input.valor,
      fecha_expiracion: input.fecha_expiracion,
      usos_maximos: input.usos_maximos,
      usos_actuales: 0,
      activo: true,
      created_at: new Date().toISOString(),
      monto_descontado: 0,
    };
    return of({ ...nuevo }).pipe(delay(120));
  }

  /** PATCH /api/cupones/:id/activo */
  setActivo(id: string, activo: boolean): Observable<Cupon> {
    const found = MOCK_CUPONES.find((c) => c.id === id) ?? MOCK_CUPONES[0]!;
    return of({ ...found, activo }).pipe(delay(120));
  }

  remove(id: string): Observable<void> {
    return of(undefined as void).pipe(delay(120));
  }
}
