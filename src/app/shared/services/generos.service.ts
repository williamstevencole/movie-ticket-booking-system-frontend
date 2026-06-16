import { Observable } from 'rxjs';

export type Genero = {
  id: string;
  nombre: string;
};

export type CrearGeneroInput = {
  nombre: string;
};

export type EditarGeneroInput = {
  nombre: string;
};

export abstract class GenerosService {
  abstract list(): Observable<Genero[]>;
  abstract create(input: CrearGeneroInput): Observable<Genero>;
  abstract update(id: string, input: EditarGeneroInput): Observable<Genero>;
  abstract delete(id: string): Observable<void>;
}
