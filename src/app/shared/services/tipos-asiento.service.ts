import { Observable } from 'rxjs';

export type TipoAsiento = {
  id: string;
  nombre: string;
  color?: string;
  salas_usando: number;
  asientos_total: number;
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
  abstract remove(id: string): Observable<void>;
}
