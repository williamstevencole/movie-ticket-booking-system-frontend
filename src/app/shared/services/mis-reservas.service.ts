import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EstadoReserva, ReservaAsiento } from './reservas.service';

/**
 * View-model del boleto (reserva enriquecida con joins de funcion, pelicula, cine y pago).
 * Formerly in boletos.service.ts — moved here in Task 11.
 */
export interface Boleto {
  id: string;
  numero_reserva: string;
  estado: EstadoReserva;
  created_at: string;

  id_funcion: string;
  fecha_hora: string;

  pelicula: { id: string; titulo: string; poster_url: string | null; rating_promedio?: number | null; rating_count?: number };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: ReservaAsiento[];

  monto_total: number;
  ultimos4_snapshot: string | null;
  marca_snapshot: 'visa' | 'master' | 'amex' | 'discover' | null;
}

const MOCK_BOLETOS: Boleto[] = [
  {
    id: 'b-1',
    numero_reserva: 'CIN-A-0001',
    estado: 'pagada',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    id_funcion: 'f-1',
    fecha_hora: new Date(Date.now() + 3 * 86400000).toISOString(),
    pelicula: { id: 'p-1', titulo: 'Tormenta sobre el Pacífico', poster_url: null, rating_promedio: 4.2, rating_count: 187 },
    sala: { id: 's-1', nombre: 'Sala 1' },
    cine: { id: 'gua-1', nombre: 'Cinépolis Oakland Mall' },
    asientos: [
      { id: 'ra-1', id_asiento_funcion: 'af-1', codigo: 'D5', fila: 'D', columna: 5, tipo_asiento: 'Estandar', precio: 85 },
      { id: 'ra-2', id_asiento_funcion: 'af-2', codigo: 'D6', fila: 'D', columna: 6, tipo_asiento: 'Estandar', precio: 85 },
    ],
    monto_total: 170,
    ultimos4_snapshot: '4242',
    marca_snapshot: 'visa',
  },
  {
    id: 'b-2',
    numero_reserva: 'CIN-A-0002',
    estado: 'pagada',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    id_funcion: 'f-2',
    fecha_hora: new Date(Date.now() + 10 * 86400000).toISOString(),
    pelicula: { id: 'p-2', titulo: 'Cartas a mi yo de mañana', poster_url: null, rating_promedio: 4.5, rating_count: 312 },
    sala: { id: 's-2', nombre: 'Sala 3' },
    cine: { id: 'tgu-1', nombre: 'Multiplaza' },
    asientos: [
      { id: 'ra-3', id_asiento_funcion: 'af-3', codigo: 'B3', fila: 'B', columna: 3, tipo_asiento: 'VIP', precio: 165 },
    ],
    monto_total: 165,
    ultimos4_snapshot: '5555',
    marca_snapshot: 'master',
  },
  {
    id: 'b-3',
    numero_reserva: 'CIN-A-0003',
    estado: 'cancelada',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    id_funcion: 'f-3',
    fecha_hora: new Date(Date.now() - 7 * 86400000).toISOString(),
    pelicula: { id: 'p-3', titulo: 'El Reino de Niebla', poster_url: null, rating_promedio: 3.8, rating_count: 94 },
    sala: { id: 's-3', nombre: 'Sala 2' },
    cine: { id: 'sps-1', nombre: 'Cinépolis City Mall' },
    asientos: [
      { id: 'ra-4', id_asiento_funcion: 'af-4', codigo: 'F7', fila: 'F', columna: 7, tipo_asiento: 'Estandar', precio: 80 },
      { id: 'ra-5', id_asiento_funcion: 'af-5', codigo: 'F8', fila: 'F', columna: 8, tipo_asiento: 'Estandar', precio: 80 },
    ],
    monto_total: 160,
    ultimos4_snapshot: null,
    marca_snapshot: null,
  },
];

@Injectable({ providedIn: 'root' })
export class MisReservasService {
  list(estado?: string) {
    const result = estado
      ? MOCK_BOLETOS.filter((b) => b.estado === estado)
      : MOCK_BOLETOS;
    return of([...result]).pipe(delay(120));
  }

  getByNumero(numero: string) {
    const found = MOCK_BOLETOS.find((b) => b.numero_reserva === numero) ?? MOCK_BOLETOS[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  cancelar(numero: string) {
    const reserva = MOCK_BOLETOS.find((b) => b.numero_reserva === numero) ?? MOCK_BOLETOS[0]!;
    return of({ reserva: { ...reserva, estado: 'cancelada' as const }, reembolso: null }).pipe(delay(120));
  }
}
