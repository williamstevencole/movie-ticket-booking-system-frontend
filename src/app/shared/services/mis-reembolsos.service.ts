import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type MiReembolso = {
  id: string;
  numero_reserva: string;
  porcentaje_aplicado: number;
  monto: number;
  estado: 'pendiente' | 'procesado' | 'rechazado';
  fecha_procesado: string | null;
  motivo_rechazo: string | null;
};

type BackendMiReembolso = {
  id: string;
  numero_reserva: string;
  monto: string;
  estado: string;
  porcentaje_aplicado: string;
  fecha_procesado: string | null;
  motivo_rechazo: string | null;
};

@Injectable({ providedIn: 'root' })
export class MisReembolsosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/me/reembolsos`;

  list(): Observable<MiReembolso[]> {
    return this.http.get<BackendMiReembolso[]>(this.base).pipe(
      map((rows) =>
        rows.map((r) => ({
          id: r.id,
          numero_reserva: r.numero_reserva,
          porcentaje_aplicado: parseFloat(r.porcentaje_aplicado),
          monto: parseFloat(r.monto),
          estado: r.estado as MiReembolso['estado'],
          fecha_procesado: r.fecha_procesado,
          motivo_rechazo: r.motivo_rechazo,
        })),
      ),
    );
  }
}
