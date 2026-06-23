export type EstadoAsiento =
  | 'disponible'
  | 'ocupado'
  | 'seleccionado'
  | 'reservado'
  | 'bloqueado';

export interface Asiento {
  id: string;
  fila: string;
  numero: number;
  estado: EstadoAsiento;
  bloqueado_hasta?: string;  // ISO; present if estado === 'bloqueado'
  version: number;            // concurrency control
}
