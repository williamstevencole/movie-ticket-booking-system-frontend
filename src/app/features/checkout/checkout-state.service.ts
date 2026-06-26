import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asiento } from '../asientos/mapa/asiento.model';
import { ReservasService, CrearReservaInput } from '../../shared/services/reservas.service';
import { ToastService } from '../../shared/services/toast.service';

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

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  private readonly reservasSvc = inject(ReservasService);
  private readonly toastSvc = inject(ToastService);

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
   * Handles 409 Conflict by showing toast and returning error for caller to refresh.
   */

  
  confirmarReserva(
    funcionId: string,
    asientosSeleccionados: Asiento[],
  ): Observable<any> {
    const payload: CrearReservaInput = {
    id_funcion: funcionId,
    ids_asiento_funcion: asientosSeleccionados.map((a) => a.id),
    };

    return this.reservasSvc.crear(payload).pipe(
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
