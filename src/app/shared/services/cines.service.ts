import { Observable } from 'rxjs';

export type Sala = {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
};

export type Cine = {
  id: string;
  nombre: string;
  direccion: string | null;
  id_ciudad: string;
  salas: Sala[];
  fecha_creacion: string;
};

export type CinesPage = {
  data: Cine[];
  total: number;
  page: number;
  limit: number;
};

export type ListCinesQuery = {
  name?: string;
  page?: number;
  limit?: number;
  id_ciudad?: number | string;
};

export type CrearCineInput = {
  nombre: string;
  id_ciudad: string;
  direccion: string | null;
};

export type EditarCineInput = Partial<CrearCineInput>;

export type CrearSalaInput = {
  nombre: string;
  filas: number;
  columnas: number;
};

export abstract class CinesService {
  abstract list(query?: ListCinesQuery): Observable<CinesPage>;
  abstract getById(id: string): Observable<Cine>;
  abstract create(input: CrearCineInput): Observable<Cine>;
  abstract update(id: string, input: EditarCineInput): Observable<Cine>;
  abstract addSala(idCine: string, input: CrearSalaInput): Observable<Sala>;
}
