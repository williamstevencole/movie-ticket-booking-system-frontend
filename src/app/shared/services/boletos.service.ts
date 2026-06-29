import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type { Boleto } from './mis-reservas.service';

@Injectable({ providedIn: 'root' })
export class BoletosService {
  private readonly http = inject(HttpClient);

  obtenerCodigoFirmado(numeroReserva: string): Observable<string> {
    return this.http
      .get<{ codigo: string }>(`${API_URL}/me/reservas/${numeroReserva}/codigo-firmado`)
      .pipe(map((r) => r.codigo));
  }

  urlPdf(codigoFirmado: string, modo: 'inline' | 'download' = 'inline'): string {
    const dl = modo === 'download' ? '?download=1' : '';
    return `${API_URL}/boletos/${codigoFirmado}.pdf${dl}`;
  }
}
