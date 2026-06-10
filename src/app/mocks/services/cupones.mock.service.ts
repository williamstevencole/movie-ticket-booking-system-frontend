import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Cupon,
  CuponesService,
  ValidarCuponResponse,
} from '../../shared/services/cupones.service';
import { MOCK_CUPONES } from '../data/cupones.mock';

const SIMULATED_LATENCY_MS = 150;

@Injectable()
export class MockCuponesService extends CuponesService {
  override list(): Observable<Cupon[]> {
    return of(MOCK_CUPONES).pipe(delay(SIMULATED_LATENCY_MS));
  }

  override getById(id: string): Observable<Cupon> {
    const cupon = MOCK_CUPONES.find((c) => c.id === id);
    if (!cupon) {
      return throwError(() => ({ status: 404, error: { message: 'Cupón no encontrado' } }));
    }
    return of(cupon).pipe(delay(SIMULATED_LATENCY_MS));
  }

  override validar(codigo: string): Observable<ValidarCuponResponse> {
    const cupon = MOCK_CUPONES.find(
      (c) => c.codigo.toLowerCase() === codigo.toLowerCase(),
    );

    if (!cupon) {
      return of({ valido: false, mensaje: 'Código no encontrado' }).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }

    const ahora = Date.now();
    const exp = new Date(cupon.fecha_expiracion).getTime();
    if (exp < ahora) {
      return of({ valido: false, mensaje: 'Cupón vencido' }).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }
    if (
      cupon.usos_maximos !== null &&
      cupon.usos_actuales >= cupon.usos_maximos
    ) {
      return of({ valido: false, mensaje: 'Cupón agotado' }).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }
    if (!cupon.activo) {
      return of({ valido: false, mensaje: 'Cupón inactivo' }).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }

    return of({ valido: true, cupon }).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
