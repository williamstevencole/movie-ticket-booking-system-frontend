import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearCuponInput,
  Cupon,
  CuponesService,
  ValidarCuponResponse,
} from '../../shared/services/cupones.service';
import { MOCK_CUPONES } from '../data/cupones.mock';

@Injectable()
export class MockCuponesService extends CuponesService {
  private store: Cupon[] = MOCK_CUPONES.map((c) => ({ ...c }));

  override list(): Observable<Cupon[]> {
    return of(this.store.map((c) => ({ ...c })));
  }

  override getById(id: string): Observable<Cupon> {
    const cupon = this.store.find((c) => c.id === id);
    if (!cupon) {
      return throwError(() => ({ status: 404, error: { message: 'Cupón no encontrado' } }));
    }
    return of({ ...cupon });
  }

  override validar(codigo: string): Observable<ValidarCuponResponse> {
    const cupon = this.store.find(
      (c) => c.codigo.toLowerCase() === codigo.toLowerCase(),
    );

    if (!cupon) {
      return of({ valido: false, mensaje: 'Código no encontrado' });
    }

    const ahora = Date.now();
    const exp = new Date(cupon.fecha_expiracion).getTime();
    if (exp < ahora) {
      return of({ valido: false, mensaje: 'Cupón vencido' });
    }
    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      return of({ valido: false, mensaje: 'Cupón agotado' });
    }
    if (!cupon.activo) {
      return of({ valido: false, mensaje: 'Cupón inactivo' });
    }

    return of({ valido: true, cupon: { ...cupon } });
  }

  override create(input: CrearCuponInput): Observable<Cupon> {
    const codigo = input.codigo.trim().toUpperCase();
    if (!codigo) {
      return throwError(() => ({ code: 'EMPTY', message: 'El código no puede estar vacío' }));
    }
    if (this.store.some((c) => c.codigo.toUpperCase() === codigo)) {
      return throwError(() => ({ code: 'DUPLICATE', message: 'Ya existe un cupón con ese código' }));
    }
    if (!(input.valor > 0)) {
      return throwError(() => ({ code: 'BAD_VALUE', message: 'El valor debe ser mayor a 0' }));
    }
    if (input.tipo === 'porcentaje' && input.valor > 100) {
      return throwError(() => ({ code: 'BAD_PERCENT', message: 'El porcentaje no puede ser mayor a 100' }));
    }
    if (new Date(input.fecha_expiracion).getTime() <= Date.now()) {
      return throwError(() => ({ code: 'BAD_DATE', message: 'La fecha de expiración debe ser futura' }));
    }
    if (
      input.usos_maximos !== null &&
      (!Number.isInteger(input.usos_maximos) || input.usos_maximos < 1)
    ) {
      return throwError(() => ({ code: 'BAD_USES', message: 'Los usos máximos deben ser un entero mayor a 0' }));
    }
    const cupon: Cupon = {
      id: `cup-${Date.now().toString(36)}`,
      codigo,
      tipo: input.tipo,
      valor: input.valor,
      fecha_expiracion: input.fecha_expiracion,
      usos_maximos: input.usos_maximos,
      usos_actuales: 0,
      activo: true,
      created_at: new Date().toISOString(),
      monto_descontado: 0,
    };
    this.store = [cupon, ...this.store];
    return of({ ...cupon });
  }

  override setActivo(id: string, activo: boolean): Observable<Cupon> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Cupón no encontrado' }));
    }
    const current = this.store[idx]!;
    if (activo && new Date(current.fecha_expiracion).getTime() < Date.now()) {
      return throwError(() => ({
        code: 'EXPIRED',
        message: 'No se puede activar un cupón vencido',
      }));
    }
    const next: Cupon = { ...current, activo };
    this.store[idx] = next;
    return of({ ...next });
  }

  override remove(id: string): Observable<void> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Cupón no encontrado' }));
    }
    if (this.store[idx]!.usos_actuales > 0) {
      return throwError(() => ({
        code: 'HAS_USES',
        message: 'No se puede eliminar un cupón que ya tiene usos',
      }));
    }
    this.store = [...this.store.slice(0, idx), ...this.store.slice(idx + 1)];
    return of(void 0);
  }
}
