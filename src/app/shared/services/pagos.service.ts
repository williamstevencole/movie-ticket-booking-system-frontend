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
  tarjeta_mask: string | null;
  tarjeta_brand?: 'visa' | 'master' | 'amex' | 'discover';
  created_at: string;
};

export abstract class PagosService {
  abstract list(): Observable<Pago[]>;
  abstract getByReserva(idReserva: string): Observable<Pago | undefined>;
}
