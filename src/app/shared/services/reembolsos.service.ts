import { Observable } from 'rxjs';

export type EstadoReembolso = 'pendiente' | 'procesado' | 'rechazado';

export type Reembolso = {
  id: string;
  id_pago: string;
  porcentaje_aplicado: number;
  monto: number;
  estado: EstadoReembolso;
  fecha_procesado: string | null;
  created_at: string;
};

export abstract class ReembolsosService {
  abstract list(): Observable<Reembolso[]>;
}
