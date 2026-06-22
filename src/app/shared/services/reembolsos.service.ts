import { Observable } from 'rxjs';

export type EstadoReembolso = 'pendiente' | 'procesado' | 'rechazado';

export type Reembolso = {
  id: string;
  id_pago: string;
  id_politica: string | null;
  porcentaje_aplicado: number;
  monto: number;
  estado: EstadoReembolso;
  fecha_procesado: string | null;
  created_at: string;
};

/* ───── Panel operacional admin (vista enriquecida) ───── */

export type EstadoReembolsoAdmin =
  | 'pendiente'
  | 'procesando'
  | 'completado'
  | 'rechazado';

export type MetodoReembolso = 'tarjeta' | 'efectivo';

export type ReembolsoAdmin = {
  id: string;
  reserva: string;
  cliente: string;
  pelicula: string;
  monto: number;
  metodo: MetodoReembolso;
  diasEnCola: number;
  politica: string;
  porcentaje: number;
  estado: EstadoReembolsoAdmin;
  motivoRechazo: string | null;
  fechaProcesado: string | null;
  created_at: string;
};

export abstract class ReembolsosService {
  abstract list(): Observable<Reembolso[]>;
  abstract listAdmin(): Observable<ReembolsoAdmin[]>;
  abstract procesar(id: string): Observable<ReembolsoAdmin>;
  abstract rechazar(id: string, motivo: string): Observable<ReembolsoAdmin>;
}
