import { Observable } from 'rxjs';

export type MetodoPagoTipo = 'tarjeta'; // expandir si hay más

export type MetodoPago = {
  id: string;
  id_usuario: string;
  tipo: MetodoPagoTipo;
  marca?: string;       // 'visa' | 'mastercard' | ...
  ultimos4?: string;    // '1234'
  expiracion?: string;  // 'MM/YY'
  titular?: string;
  predeterminado: boolean;
  created_at: string;
};

export type CrearMetodoPagoDto = {
  tipo: MetodoPagoTipo;
  numero: string;       // PAN raw, backend cifra
  expiracion: string;
  titular: string;
  predeterminado?: boolean;
};

export abstract class MetodosPagoService {
  abstract listar(): Observable<MetodoPago[]>;
  abstract crear(dto: CrearMetodoPagoDto): Observable<MetodoPago>;
  abstract actualizar(id: string, dto: Partial<CrearMetodoPagoDto>): Observable<MetodoPago>;
  abstract borrar(id: string): Observable<void>;
  abstract marcarPredeterminado(id: string): Observable<MetodoPago>;
}
