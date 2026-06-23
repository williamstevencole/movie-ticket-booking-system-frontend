import { TipoAsiento } from './seat-types/seat-type.model';
import { EstadoAsiento } from './seat-states/seat-state.model';


export interface Asiento {

  id: string;

  fila: string;

  numero: number;

  tipo: TipoAsiento;

  estado: EstadoAsiento;

  bloqueado_hasta?: string;  // ISO; present if estado === 'bloqueado'

  version: number;            // concurrency control

}