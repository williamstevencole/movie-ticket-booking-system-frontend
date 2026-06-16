import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pago, PagosService } from '../../shared/services/pagos.service';
import { MOCK_PAGOS } from '../data/pagos.mock';

@Injectable()
export class MockPagosService extends PagosService {
  override list(): Observable<Pago[]> {
    return of([...MOCK_PAGOS]);
  }
}
