import { Observable } from 'rxjs';

export type Idioma = {
  id: string;
  nombre: string;
  codigo: string;
};

export abstract class IdiomasService {
  abstract list(): Observable<Idioma[]>;
}
