import { Observable } from 'rxjs';

export type Genero = {
  id: string;
  nombre: string;
};

export abstract class GenerosService {
  abstract list(): Observable<Genero[]>;
}
