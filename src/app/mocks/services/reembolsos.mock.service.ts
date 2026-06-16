import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Reembolso,
  ReembolsosService,
} from '../../shared/services/reembolsos.service';
import { MOCK_REEMBOLSOS } from '../data/reembolsos.mock';

@Injectable()
export class MockReembolsosService extends ReembolsosService {
  override list(): Observable<Reembolso[]> {
    return of([...MOCK_REEMBOLSOS]);
  }
}
