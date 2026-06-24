import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_FUNCIONES } from '../../mocks/data/funciones.mock';

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

export type CheckConflictosParams = {
  id_cine: string;
  id_sala: string;
  fecha_hora: string;
  duracion_min: number;
  ignorar_id?: string;
};

@Injectable({ providedIn: 'root' })
export class FuncionesService {
  list(): Observable<Funcion[]> {
    return of([...MOCK_FUNCIONES]).pipe(delay(120));
  }

  getById(id: string): Observable<Funcion> {
    const found = MOCK_FUNCIONES.find((f) => f.id === id) ?? MOCK_FUNCIONES[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  create(input: CrearFuncionInput): Observable<Funcion> {
    const nueva: Funcion = {
      id: `f-new-${Date.now()}`,
      id_pelicula: input.id_pelicula,
      id_cine: input.id_cine,
      id_sala: input.id_sala,
      fecha_hora: input.fecha_hora,
      estado: 'programada',
      boletos_vendidos: 0,
      created_at: new Date().toISOString(),
    };
    return of({ ...nueva }).pipe(delay(120));
  }

  update(id: string, input: EditarFuncionInput): Observable<Funcion> {
    const found = MOCK_FUNCIONES.find((f) => f.id === id) ?? MOCK_FUNCIONES[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  cancelar(id: string): Observable<Funcion> {
    const found = MOCK_FUNCIONES.find((f) => f.id === id) ?? MOCK_FUNCIONES[0]!;
    return of({ ...found, estado: 'cancelada' as EstadoFuncion }).pipe(delay(120));
  }

  /** GET /api/admin/funciones/conflictos */
  checkConflictos(params: CheckConflictosParams): Observable<ConflictoFuncion[]> {
    // Mock: no conflicts found
    return of([] as ConflictoFuncion[]).pipe(delay(120));
  }
}
