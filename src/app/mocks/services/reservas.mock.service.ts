import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../shared/services/reservas.service';
import {
  MOCK_RESERVAS,
  MOCK_USUARIOS_RESERVAS,
} from '../data/reservas.mock';

@Injectable()
export class MockReservasService extends ReservasService {
  override list(): Observable<Reserva[]> {
    return of([...MOCK_RESERVAS]);
  }
  override listUsuarios(): Observable<ReservaUsuario[]> {
    return of([...MOCK_USUARIOS_RESERVAS]);
  }
}
