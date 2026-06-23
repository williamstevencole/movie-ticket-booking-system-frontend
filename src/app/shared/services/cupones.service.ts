import { Observable } from 'rxjs';

export type CuponTipo = 'porcentaje' | 'monto' | 'monto_fijo';

export type Cupon = {
  id: string;
  codigo: string;
  tipo: CuponTipo | string;
  valor: number | string;
  fecha_expiracion: string;
  usos_maximos: number | null;
  usos_actuales: number;
  activo: boolean;
  created_at: string;
  monto_descontado?: number;
  titulo?: string;
  descripcion?: string;
};

export type ValidarCuponResponse = {
  valido: boolean;
  cupon?: Cupon;
  mensaje?: string;
};

export type CrearCuponInput = {
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  fecha_expiracion: string;
  usos_maximos: number | null;
};

export abstract class CuponesService {
  abstract list(): Observable<Cupon[]>;
  abstract getById(id: string): Observable<Cupon>;
  abstract validar(codigo: string): Observable<ValidarCuponResponse>;
  abstract create(input: CrearCuponInput): Observable<Cupon>;
  abstract setActivo(id: string, activo: boolean): Observable<Cupon>;
  abstract remove(id: string): Observable<void>;
}
