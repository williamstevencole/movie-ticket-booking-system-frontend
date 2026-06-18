import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
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
