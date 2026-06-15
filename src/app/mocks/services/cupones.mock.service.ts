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
  override list(): Observable<Cupon[]> {
    return of(MOCK_CUPONES);
  }

  override getById(id: string): Observable<Cupon> {
    const cupon = MOCK_CUPONES.find((c) => c.id === id);
    if (!cupon) {
      return throwError(() => ({ status: 404, error: { message: 'Cupón no encontrado' } }));
    }
    return of(cupon);
  }

  override validar(codigo: string): Observable<ValidarCuponResponse> {
    const cupon = MOCK_CUPONES.find(
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

    return of({ valido: true, cupon });
  }
}
