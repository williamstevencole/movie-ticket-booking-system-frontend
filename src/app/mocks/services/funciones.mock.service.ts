import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  ConflictoFuncion,
  CrearFuncionInput,
  EditarFuncionInput,
  Funcion,
  FuncionesService,
} from '../../shared/services/funciones.service';
import { MOCK_FUNCIONES } from '../data/funciones.mock';
import { MOCK_PELICULAS } from '../data/peliculas.mock';

const BUFFER_MIN = 15;

@Injectable()
export class MockFuncionesService extends FuncionesService {
  private store: Funcion[] = MOCK_FUNCIONES.map((f) => ({ ...f }));

  override list(): Observable<Funcion[]> {
    return of(
      [...this.store].sort(
        (a, b) =>
          new Date(a.fecha_hora).getTime() -
          new Date(b.fecha_hora).getTime(),
      ),
    );
  }

  override getById(id: string): Observable<Funcion> {
    const f = this.store.find((x) => x.id === id);
    if (!f) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Función no encontrada' }));
    }
    return of({ ...f });
  }

  override create(input: CrearFuncionInput): Observable<Funcion> {
    const duracion = this.duracionPelicula(input.id_pelicula);
    if (duracion === null) {
      return throwError(() => ({ code: 'INVALID_PELICULA', message: 'Película no encontrada' }));
    }
    const conflictos = this.computeConflictos(
      input.id_cine,
      input.id_sala,
      input.fecha_hora,
      duracion,
    );
    if (conflictos.length > 0) {
      return throwError(() => ({
        code: 'CONFLICT',
        message: 'Hay otra función en esa sala dentro del horario',
      }));
    }

    const funcion: Funcion = {
      id: this.nextId(),
      id_pelicula: input.id_pelicula,
      id_cine: input.id_cine,
      id_sala: input.id_sala,
      fecha_hora: input.fecha_hora,
      estado: 'programada',
      boletos_vendidos: 0,
      created_at: new Date().toISOString(),
    };
    this.store.push(funcion);
    return of({ ...funcion });
  }

  override update(id: string, input: EditarFuncionInput): Observable<Funcion> {
    const idx = this.store.findIndex((x) => x.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Función no encontrada' }));
    }
    const current = this.store[idx]!;
    if (current.estado === 'cancelada' || current.estado === 'finalizada') {
      return throwError(() => ({
        code: 'INVALID_STATE',
        message: 'No se puede editar una función ' + current.estado,
      }));
    }
    const next: Funcion = { ...current, ...input };
    const duracion = this.duracionPelicula(next.id_pelicula);
    if (duracion === null) {
      return throwError(() => ({ code: 'INVALID_PELICULA', message: 'Película no encontrada' }));
    }
    const conflictos = this.computeConflictos(
      next.id_cine,
      next.id_sala,
      next.fecha_hora,
      duracion,
      id,
    );
    if (conflictos.length > 0) {
      return throwError(() => ({
        code: 'CONFLICT',
        message: 'Hay otra función en esa sala dentro del horario',
      }));
    }
    this.store[idx] = next;
    return of({ ...next });
  }

  override cancelar(id: string): Observable<Funcion> {
    const idx = this.store.findIndex((x) => x.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Función no encontrada' }));
    }
    const current = this.store[idx]!;
    if (current.estado !== 'programada') {
      return throwError(() => ({
        code: 'INVALID_STATE',
        message: 'Solo se pueden cancelar funciones programadas',
      }));
    }
    const next: Funcion = { ...current, estado: 'cancelada' };
    this.store[idx] = next;
    return of({ ...next });
  }

  override checkConflictos(
    id_cine: string,
    id_sala: string,
    fecha_hora: string,
    duracion_min: number,
    ignoreId?: string,
  ): Observable<ConflictoFuncion[]> {
    return of(
      this.computeConflictos(id_cine, id_sala, fecha_hora, duracion_min, ignoreId),
    );
  }

  private computeConflictos(
    id_cine: string,
    id_sala: string,
    fecha_hora: string,
    duracion_min: number,
    ignoreId?: string,
  ): ConflictoFuncion[] {
    const start = new Date(fecha_hora).getTime();
    if (Number.isNaN(start)) return [];
    const end = start + (duracion_min + BUFFER_MIN) * 60_000;

    return this.store
      .filter((f) => f.id_cine === id_cine && f.id_sala === id_sala)
      .filter((f) => f.id !== ignoreId)
      .filter((f) => f.estado === 'programada' || f.estado === 'en_curso')
      .map((f) => {
        const fStart = new Date(f.fecha_hora).getTime();
        const fDur = this.duracionPelicula(f.id_pelicula) ?? 120;
        const fEnd = fStart + (fDur + BUFFER_MIN) * 60_000;
        const overlaps = start < fEnd && fStart < end;
        return overlaps ? ({ funcion: { ...f }, motivo: 'solapamiento' as const }) : null;
      })
      .filter((x): x is ConflictoFuncion => x !== null);
  }

  private duracionPelicula(id: string): number | null {
    const p = MOCK_PELICULAS.find((x) => x.id === id);
    return p?.duracion_min ?? null;
  }

  private nextId(): string {
    const maxNum = this.store
      .map((f) => Number(f.id.replace(/^f-/, '')))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `f-${maxNum + 1}`;
  }
}
