import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../core/config/env';

export type MetodoPagoTipo = 'tarjeta' | 'efectivo';
export type MarcaTarjeta = 'visa' | 'mastercard' | 'amex';

export type MetodoPago = {
  id: string;
  tipo: MetodoPagoTipo;
  marca: MarcaTarjeta | null;
  ultimos4: string | null;
  expiracion: string | null;
  titular: string | null;
  predeterminado: boolean;
  created_at: string;
};

export type CrearMetodoPagoDto = {
  tipo: MetodoPagoTipo;
  numero?: string;
  marca?: MarcaTarjeta;
  expiracion?: string;
  titular?: string;
};

function detectarMarca(numero: string): MarcaTarjeta {
  const n = numero.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (n.startsWith('5')) return 'mastercard';
  if (n.startsWith('3')) return 'amex';
  return 'visa';
}

@Injectable({ providedIn: 'root' })
export class MetodosPagoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/me/metodos-pago`;

  listar(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.base);
  }

  crear(dto: CrearMetodoPagoDto): Observable<MetodoPago> {
    const numero = dto.numero?.replace(/\s/g, '');
    const body: CrearMetodoPagoDto = {
      tipo: dto.tipo,
      ...(dto.tipo === 'tarjeta' && {
        numero,
        marca: dto.marca ?? (numero ? detectarMarca(numero) : undefined),
        expiracion: dto.expiracion,
        titular: dto.titular,
      }),
    };
    return this.http.post<MetodoPago>(this.base, body);
  }

  borrar(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.base}/${id}`);
  }

  marcarPredeterminado(id: string): Observable<MetodoPago> {
    return this.http.patch<MetodoPago>(`${this.base}/${id}/predeterminada`, {});
  }
}
