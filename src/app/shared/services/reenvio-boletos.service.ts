import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type ReenvioResult = { ok: true } | { ok: false; retryAfter: number };

interface BackendReenvioResponse {
  ok: boolean;
  retry_after?: number;
}

@Injectable({ providedIn: 'root' })
export class ReenvioBoletosService {
  private readonly http = inject(HttpClient);

  reenviarMio(numeroReserva: string): Observable<ReenvioResult> {
    return this.http
      .post<BackendReenvioResponse>(`${API_URL}/me/reservas/${numeroReserva}/reenviar-boleto`, {})
      .pipe(map((r) => this.normalize(r)));
  }

  reenviarComoAdmin(idReserva: string): Observable<ReenvioResult> {
    return this.http
      .post<BackendReenvioResponse>(`${API_URL}/admin/reservas/${idReserva}/reenviar-boleto`, {})
      .pipe(map((r) => this.normalize(r)));
  }

  reenviarComprobanteReembolso(idReserva: string): Observable<ReenvioResult> {
    return this.http
      .post<BackendReenvioResponse>(`${API_URL}/admin/reservas/${idReserva}/reenviar-comprobante-reembolso`, {})
      .pipe(map((r) => this.normalize(r)));
  }

  private normalize(r: BackendReenvioResponse): ReenvioResult {
    return r.ok ? { ok: true } : { ok: false, retryAfter: r.retry_after ?? 60 };
  }
}
