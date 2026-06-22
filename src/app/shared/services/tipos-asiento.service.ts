import { Observable } from 'rxjs';

export type TipoAsiento = {
  id: string;
  nombre: string;
  color: string;
  activo: boolean;
  salas_usando: number;
  asientos_total: number;
  created_at: string;
};

export type CrearTipoAsientoInput = {
  nombre: string;
  color: string;
};

export type EditarTipoAsientoInput = Partial<CrearTipoAsientoInput>;

export abstract class TiposAsientoService {
  abstract list(): Observable<TipoAsiento[]>;
  abstract create(input: CrearTipoAsientoInput): Observable<TipoAsiento>;
  abstract update(
    id: string,
    input: EditarTipoAsientoInput,
  ): Observable<TipoAsiento>;
  abstract setActivo(id: string, activo: boolean): Observable<TipoAsiento>;
  abstract remove(id: string): Observable<void>;
}
