import { Observable } from 'rxjs';

export type EstadoReserva =
  | 'pendiente_pago'
  | 'pagada'
  | 'cancelada'
  | 'reembolsada'
  | 'expirada';

export type ReservaAsiento = {
  id: string;
  id_asiento_funcion: string;
  codigo: string;       // e.g. 'A5'
  fila: string;         // e.g. 'A'
  columna: number;      // e.g. 5
  tipo_asiento: string; // 'Estandar' | 'VIP' | ...
  precio: number;
};

export type Reserva = {
  id: string;
  numero_reserva: string;
  id_usuario: string;
  id_funcion: string;
  estado: EstadoReserva;
  num_asientos: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
  asientos: ReservaAsiento[];  // replaces asientos_codigos
  expira_en?: string;          // ISO — present for pendiente_pago
  cupon_codigo?: string;
  notas_internas?: string;
};

export type ConfirmarReservaInput = {
  id_funcion: string;
  asientos: Array<{
    id_asiento_funcion: string;
    version: number;
  }>;
};

export type ReservaUsuario = {
  id: string;
  nombre: string;
  email: string;
};

export abstract class ReservasService {
  abstract list(): Observable<Reserva[]>;
  abstract listUsuarios(): Observable<ReservaUsuario[]>;
  abstract getById(id: string): Observable<Reserva | undefined>;
  abstract getUsuario(id: string): Observable<ReservaUsuario | undefined>;
  abstract confirmar(input: ConfirmarReservaInput): Observable<Reserva>;
}
