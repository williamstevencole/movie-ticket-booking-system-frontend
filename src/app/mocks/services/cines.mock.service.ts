import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Cine,
  CinesPage,
  CinesService,
  ListCinesQuery,
} from '../../shared/services/cines.service';
import { MOCK_CINES } from '../data/cines.mock';

@Injectable()
export class MockCinesService extends CinesService {
  override list(query?: ListCinesQuery): Observable<CinesPage> {
    let data = MOCK_CINES;

    if (query?.id_ciudad !== undefined && query.id_ciudad !== null) {
      const id = String(query.id_ciudad);
      data = data.filter((c) => c.id_ciudad === id);
    }
    if (query?.name) {
      const needle = query.name.toLowerCase();
      data = data.filter((c) => c.nombre.toLowerCase().includes(needle));
    }

    return of({
      data,
      total: data.length,
      page: query?.page ?? 1,
      limit: query?.limit ?? data.length,
    });
  }

  override getById(id: string): Observable<Cine> {
    const cine = MOCK_CINES.find((c) => c.id === id);
    if (!cine) {
      return throwError(() => ({ status: 404, error: { message: 'Cine no encontrado' } }));
    }
    return of(cine);
  }
}
