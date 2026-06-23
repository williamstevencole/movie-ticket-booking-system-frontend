import { Observable } from 'rxjs';

export type Idioma = {
  id: string;
  nombre: string;
};

export type CrearIdiomaInput = {
  nombre: string;
};

export type EditarIdiomaInput = {
  nombre: string;
};

export abstract class IdiomasService {
  abstract list(): Observable<Idioma[]>;
  abstract create(input: CrearIdiomaInput): Observable<Idioma>;
  abstract update(id: string, input: EditarIdiomaInput): Observable<Idioma>;
  abstract delete(id: string): Observable<void>;
}
