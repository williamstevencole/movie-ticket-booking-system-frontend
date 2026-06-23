import { Observable } from 'rxjs';

export type MetodoPago = 'tarjeta' | 'efectivo';
export type EstadoPago = 'procesando' | 'exitoso' | 'rechazado' | 'reembolsado';

export type Pago = {
  id: string;
  id_reserva: string;
  monto_original: number;
  monto_descuento: number;
  monto_final: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  referencia_externa: string | null;
  ultimos4_snapshot?: string | null;
  marca_snapshot?: 'visa' | 'master' | 'amex' | 'discover';
  id_metodo_pago?: string;
  id_cupon?: string;
  created_at: string;
};

export abstract class PagosService {
  abstract list(): Observable<Pago[]>;
  abstract getByReserva(idReserva: string): Observable<Pago | undefined>;
}
