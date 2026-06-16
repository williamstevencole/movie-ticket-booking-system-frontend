import { Observable } from 'rxjs';

export type EstadoReserva =
  | 'pendiente_pago'
  | 'pagada'
  | 'cancelada'
  | 'reembolsada';

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
};

export type ReservaUsuario = {
  id: string;
  nombre: string;
  email: string;
};

export abstract class ReservasService {
  abstract list(): Observable<Reserva[]>;
  abstract listUsuarios(): Observable<ReservaUsuario[]>;
}
