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
}