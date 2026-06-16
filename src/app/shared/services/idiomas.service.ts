import { Observable } from 'rxjs';

export type Idioma = {
  id: string;
  nombre: string;
  codigo: string;
};

export type CrearIdiomaInput = {
  nombre: string;
  codigo: string;
};

export type EditarIdiomaInput = {
  nombre: string;
  codigo: string;
};

export abstract class IdiomasService {
  abstract list(): Observable<Idioma[]>;
  abstract create(input: CrearIdiomaInput): Observable<Idioma>;
  abstract update(id: string, input: EditarIdiomaInput): Observable<Idioma>;
  abstract delete(id: string): Observable<void>;
}
