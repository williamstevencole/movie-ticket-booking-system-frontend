import { Observable } from 'rxjs';

export type EstadoReserva =
  | 'pendiente_pago'
  | 'pagada'
  | 'cancelada'
  | 'reembolsada'
  | 'expirada';

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
  expira_en?: string;
  asientos_codigos?: string[];
  cupon_codigo?: string;
  notas_internas?: string;
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
}
