import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_REEMBOLSOS } from '../../mocks/data/reembolsos.mock';

export type MiReembolso = {
  id: string;
  id_pago: string;
  id_politica: string | null;
  porcentaje_aplicado: number;
  monto: number;
  estado: 'pendiente' | 'procesado' | 'rechazado';
  fecha_procesado: string | null;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class MisReembolsosService {
  list() {
    return of([...MOCK_REEMBOLSOS]).pipe(delay(120));
  }
}
