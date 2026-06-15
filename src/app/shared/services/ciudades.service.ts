import { Observable } from 'rxjs';

export type Ciudad = {
  id: string;
  nombre: string;
  created_at: string;
};

export type CrearCiudadInput = {
  nombre: string;
};

export type EditarCiudadInput = {
  nombre: string;
};

export abstract class CiudadesService {
  abstract list(): Observable<Ciudad[]>;
  abstract create(input: CrearCiudadInput): Observable<Ciudad>;
  abstract update(id: string, input: EditarCiudadInput): Observable<Ciudad>;
  abstract delete(id: string): Observable<void>;
}
