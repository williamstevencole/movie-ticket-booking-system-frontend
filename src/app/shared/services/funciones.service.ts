import { Observable } from 'rxjs';

export type EstadoFuncion = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';

export type Funcion = {
  id: string;
  id_pelicula: string;
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
  estado: EstadoFuncion;
  boletos_vendidos: number;
  created_at: string;
};

export type CrearFuncionInput = {
  id_pelicula: string;
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
};

export type EditarFuncionInput = Partial<CrearFuncionInput>;

export type ConflictoFuncion = {
  funcion: Funcion;
  motivo: 'solapamiento';
};

export abstract class FuncionesService {
  abstract list(): Observable<Funcion[]>;
  abstract getById(id: string): Observable<Funcion>;
  abstract create(input: CrearFuncionInput): Observable<Funcion>;
  abstract update(id: string, input: EditarFuncionInput): Observable<Funcion>;
  abstract cancelar(id: string): Observable<Funcion>;
  abstract checkConflictos(
    id_cine: string,
    id_sala: string,
    fecha_hora: string,
    duracion_min: number,
    ignoreId?: string,
  ): Observable<ConflictoFuncion[]>;
}
