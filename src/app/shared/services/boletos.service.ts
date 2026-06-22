import { Observable } from 'rxjs';
import { EstadoReserva } from './reservas.service';

/**
 * View-model derivado de los joins:
 *   Reservas → Funciones → Peliculas + Cines (sala vive dentro de Cine)
 *   Reservas → Pagos (pago del cual deriva monto y tarjeta)
 *
 * Cada campo es trazable a una columna del schema Prisma.
 */
export interface Boleto {
  // Reservas
  id: string;
  numero_reserva: string;
  estado: EstadoReserva;
  created_at: string;

  // Funciones (via id_funcion). fecha_hora corresponde a Funciones.fecha_hora del schema
  // (en el frontend Funcion type se llama fecha_inicio).
  id_funcion: string;
  fecha_hora: string;

  // Peliculas (via Funciones.id_pelicula)
  pelicula: { id: string; titulo: string; poster_url: string | null };

  // Sala (via Funciones.id_sala dentro de Cines.salas)
  sala: { id: string; nombre: string };

  // Cines (frontend Funcion has id_cine denormalized; Prisma schema joins via Salas.id_cine)
  cine: { id: string; nombre: string };

  // ReservaAsientos → AsientosFuncion → Asientos
  asientos_codigos: string[];

  // Pagos (último pago exitoso o reembolsado). monto_total = Pagos.monto_final.
  monto_total: number;
  tarjeta_mask: string | null;
  tarjeta_brand: 'visa' | 'master' | 'amex' | 'discover' | null;
}

export abstract class BoletosService {
  abstract list(): Observable<Boleto[]>;
  abstract getByNumeroReserva(numero: string): Observable<Boleto | undefined>;
}
