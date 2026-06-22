export type TipoAsiento =
  | 'estandar'
  | 'vip'
  | 'accesible';


export interface SeatType {

  id: TipoAsiento;

  nombre: string;

  precio: number;

  color: string;

  icon?: string;

}