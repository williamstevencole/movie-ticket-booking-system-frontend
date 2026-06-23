import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Reserva,
  ReservaUsuario,
  ReservasService,
  ConfirmarReservaInput,
} from '../../shared/services/reservas.service';
import {
  MOCK_RESERVAS,
  MOCK_USUARIOS_RESERVAS,
} from '../data/reservas.mock';

@Injectable()
export class MockReservasService extends ReservasService {
  private simulateConflict = false;

  // Helper for testing — simulate 409 conflict
  triggerConflict() {
    this.simulateConflict = true;
    setTimeout(() => (this.simulateConflict = false), 100);
  }

  override list(): Observable<Reserva[]> {
    return of([...MOCK_RESERVAS]);
  }
  override listUsuarios(): Observable<ReservaUsuario[]> {
    return of([...MOCK_USUARIOS_RESERVAS]);
  }
  override getById(id: string): Observable<Reserva | undefined> {
    return of(MOCK_RESERVAS.find((r) => r.id === id));
  }
  override getUsuario(id: string): Observable<ReservaUsuario | undefined> {
    return of(MOCK_USUARIOS_RESERVAS.find((u) => u.id === id));
  }
  override confirmar(input: ConfirmarReservaInput): Observable<Reserva> {
    // Mock: Simulate 409 Conflict if triggered
    if (this.simulateConflict) {
      const error: any = new Error('Conflict: Seat version mismatch');
      error.status = 409;
      error.statusText = 'Conflict';
      return throwError(() => error);
    }

    // Mock: Simulate successful confirmation
    // In real backend, this would validate versions and return 409 on conflict
    const mockReserva: Reserva = {
      id: `r-${Date.now()}`,
      numero_reserva: `#CT-${Math.floor(Math.random() * 100000)}`,
      id_usuario: 'user-1',
      id_funcion: input.id_funcion,
      estado: 'pendiente_pago',
      num_asientos: input.asientos.length,
      monto_total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      asientos: input.asientos.map((a) => ({
        id: `reserva-asiento-${Math.random()}`,
        id_asiento_funcion: a.id_asiento_funcion,
        codigo: 'A1', // placeholder
        fila: 'A',
        columna: 1,
        tipo_asiento: 'Estandar',
        precio: 100,
      })),
      expira_en: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    return of(mockReserva);
  }
}
