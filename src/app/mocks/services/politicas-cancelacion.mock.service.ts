import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  PoliticaCancelacion,
  PoliticasCancelacionService,
} from '../../shared/services/politicas-cancelacion.service';
import { MOCK_POLITICAS_CANCELACION } from '../data/politicas-cancelacion.mock';

@Injectable()
export class MockPoliticasCancelacionService extends PoliticasCancelacionService {
  override list(): Observable<PoliticaCancelacion[]> {
    return of(MOCK_POLITICAS_CANCELACION);
  }

  override getById(id: string): Observable<PoliticaCancelacion | undefined> {
    return of(MOCK_POLITICAS_CANCELACION.find((p) => p.id === id));
  }
}
