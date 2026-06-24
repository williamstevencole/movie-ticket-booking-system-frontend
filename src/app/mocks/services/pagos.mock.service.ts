/**
 * MockPagosService — kept for reference / test use.
 * No longer registered as a provider (PagosService is now a concrete HTTP class).
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pago, PagoRow } from '../../shared/services/pagos.service';
import { MOCK_PAGOS } from '../data/pagos.mock';

@Injectable()
export class MockPagosService {
  list(): Observable<{ data: PagoRow[]; total: number; page: number; limit: number }> {
    return of({ data: [...MOCK_PAGOS], total: MOCK_PAGOS.length, page: 1, limit: MOCK_PAGOS.length });
  }
  getById(id: string): Observable<Pago | undefined> {
    return of(MOCK_PAGOS.find((p) => p.id === id));
  }
  getByReserva(idReserva: string): Observable<Pago[]> {
    return of(MOCK_PAGOS.filter((p) => p.id_reserva === idReserva));
  }
}
