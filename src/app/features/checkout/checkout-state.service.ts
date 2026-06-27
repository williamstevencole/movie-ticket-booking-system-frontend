import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asiento } from '../asientos/mapa/asiento.model';
import { ConfirmarReservaInput } from '../../shared/services/reservas.service';
import { ToastService } from '../../shared/services/toast.service';
import { API_URL } from '../../core/config/env';

export type CheckoutResultado = {
  resultado: 'exito' | 'error';
  email: string;
  numeroReserva: string;
  pelicula: string;
  cine: string;
  fechaHora: string;
  asientos: string[];
  total: number;
  mensajeError?: string | null;
};

type ConfirmarReservaResponse = {
  id: string;
  numero_reserva: string;
  expira_en: string;
};

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  private readonly http = inject(HttpClient);
  private readonly toastSvc = inject(ToastService);

  private readonly reservasUrl = `${API_URL}/reservas`;

  private resultado: CheckoutResultado | null = null;

  setResultado(data: CheckoutResultado): void {
    this.resultado = data;
  }

  /** Reads the resultado once and clears it (one-shot consumption). */
  consumeResultado(): CheckoutResultado | null {
    const r = this.resultado;
    this.resultado = null;
    return r;
  }

  /**
   * Confirms a reservation with seat version information.
   * POSTs to POST /reservas (authenticated client endpoint).
   * Handles 409 Conflict by showing toast and returning error for caller to refresh.
   */
  confirmarReserva(
    funcionId: string,
    asientosSeleccionados: Asiento[],
  ): Observable<ConfirmarReservaResponse> {
    const payload: ConfirmarReservaInput = {
      id_funcion: funcionId,
      asientos: asientosSeleccionados.map((a) => ({
        id_asiento_funcion: a.id,
        version: a.version,
      })),
    };

    return this.http.post<ConfirmarReservaResponse>(this.reservasUrl, payload).pipe(
      catchError((error) => {
        if (error.status === 409) {
          this.toastSvc.show(
            'El asiento fue tomado por otro cliente, por favor seleccioná otro',
            4000,
          );
          return throwError(
            () => ({ code: 'SEAT_CONFLICT', message: 'Asiento no disponible' }),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
