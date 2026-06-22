import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Reembolso,
  ReembolsoAdmin,
  ReembolsosService,
} from '../../shared/services/reembolsos.service';
import { MOCK_REEMBOLSOS } from '../data/reembolsos.mock';
import { MOCK_REEMBOLSOS_ADMIN } from '../data/reembolsos-admin.mock';

@Injectable()
export class MockReembolsosService extends ReembolsosService {
  private store: ReembolsoAdmin[] = MOCK_REEMBOLSOS_ADMIN.map((r) => ({ ...r }));

  override list(): Observable<Reembolso[]> {
    return of([...MOCK_REEMBOLSOS]);
  }

  override listAdmin(): Observable<ReembolsoAdmin[]> {
    return of(this.store.map((r) => ({ ...r })));
  }

  override procesar(id: string): Observable<ReembolsoAdmin> {
    const idx = this.store.findIndex((r) => r.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Reembolso no encontrado' }));
    }
    const current = this.store[idx]!;
    if (current.estado === 'completado' || current.estado === 'rechazado') {
      return throwError(() => ({
        code: 'CLOSED',
        message: 'Este reembolso ya está cerrado',
      }));
    }
    // Tarjeta pendiente pasa a "procesando" (en tránsito con el banco);
    // efectivo y los que ya estaban procesando se completan.
    const next: ReembolsoAdmin =
      current.estado === 'pendiente' && current.metodo === 'tarjeta'
        ? { ...current, estado: 'procesando', diasEnCola: 0 }
        : {
            ...current,
            estado: 'completado',
            diasEnCola: 0,
            fechaProcesado: new Date().toISOString(),
          };
    this.store[idx] = next;
    return of({ ...next });
  }

  override rechazar(id: string, motivo: string): Observable<ReembolsoAdmin> {
    const idx = this.store.findIndex((r) => r.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Reembolso no encontrado' }));
    }
    const reason = motivo.trim();
    if (!reason) {
      return throwError(() => ({ code: 'NO_REASON', message: 'Debes indicar un motivo' }));
    }
    const current = this.store[idx]!;
    if (current.estado === 'completado' || current.estado === 'rechazado') {
      return throwError(() => ({
        code: 'CLOSED',
        message: 'Este reembolso ya está cerrado',
      }));
    }
    const next: ReembolsoAdmin = {
      ...current,
      estado: 'rechazado',
      motivoRechazo: reason,
      diasEnCola: 0,
      fechaProcesado: new Date().toISOString(),
    };
    this.store[idx] = next;
    return of({ ...next });
  }
}
