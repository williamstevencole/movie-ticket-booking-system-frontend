/**
 * MockReembolsosService — kept for reference / test use.
 * No longer registered as a provider (ReembolsosService split into MisReembolsosService + AdminReembolsosService in Task 13).
 */
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MiReembolso } from '../../shared/services/mis-reembolsos.service';
import { AdminReembolsoRow, EstadoReembolsoAdmin } from '../../shared/services/admin-reembolsos.service';
import { MOCK_REEMBOLSOS } from '../data/reembolsos.mock';
import { MOCK_REEMBOLSOS_ADMIN } from '../data/reembolsos-admin.mock';

@Injectable()
export class MockReembolsosService {
  private store: AdminReembolsoRow[] = MOCK_REEMBOLSOS_ADMIN.map((r) => ({ ...r }));

  list(): Observable<MiReembolso[]> {
    return of([...MOCK_REEMBOLSOS]);
  }

  listAdmin(): Observable<AdminReembolsoRow[]> {
    return of(this.store.map((r) => ({ ...r })));
  }

  procesar(id: string): Observable<AdminReembolsoRow> {
    const idx = this.store.findIndex((r) => r.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Reembolso no encontrado' }));
    }
    const current = this.store[idx]!;
    if (current.estado === 'completado' || current.estado === 'rechazado') {
      return throwError(() => ({ code: 'CLOSED', message: 'Este reembolso ya está cerrado' }));
    }
    const next: AdminReembolsoRow =
      current.estado === 'pendiente' && current.metodo === 'tarjeta'
        ? { ...current, estado: 'procesando' as EstadoReembolsoAdmin, diasEnCola: 0 }
        : { ...current, estado: 'completado' as EstadoReembolsoAdmin, diasEnCola: 0, fechaProcesado: new Date().toISOString() };
    this.store[idx] = next;
    return of({ ...next });
  }

  rechazar(id: string, motivo: string): Observable<AdminReembolsoRow> {
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
      return throwError(() => ({ code: 'CLOSED', message: 'Este reembolso ya está cerrado' }));
    }
    const next: AdminReembolsoRow = {
      ...current,
      estado: 'rechazado' as EstadoReembolsoAdmin,
      motivoRechazo: reason,
      diasEnCola: 0,
      fechaProcesado: new Date().toISOString(),
    };
    this.store[idx] = next;
    return of({ ...next });
  }
}
