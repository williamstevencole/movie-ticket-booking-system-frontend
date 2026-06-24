import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_POLITICAS_CANCELACION } from '../../mocks/data/politicas-cancelacion.mock';
import { MOCK_REGLAS_POLITICA } from '../../mocks/data/reglas-politica-cancelacion.mock';

// Espejo de model PoliticaCancelacion en api/prisma/schema.prisma
export type PoliticaCancelacion = {
  id: string;
  id_cine: string;
  nombre: string;
  activa: boolean;
  created_at: string;
};

// Espejo de model ReglaPoliticaCancelacion en api/prisma/schema.prisma
export type ReglaPolitica = {
  id: string;
  id_politica: string;
  horas_antes_minimo: number;
  horas_antes_maximo: number | null;
  porcentaje_reembolso: number;
};

export type CrearPoliticaInput = {
  id_cine: string;
  nombre: string;
};

export type EditarPoliticaInput = Partial<{
  nombre: string;
  activa: boolean;
}>;

@Injectable({ providedIn: 'root' })
export class PoliticasCancelacionService {
  list(): Observable<PoliticaCancelacion[]> {
    return of([...MOCK_POLITICAS_CANCELACION]).pipe(delay(120));
  }

  getById(id: string): Observable<PoliticaCancelacion> {
    const found = MOCK_POLITICAS_CANCELACION.find((p) => p.id === id) ?? MOCK_POLITICAS_CANCELACION[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  /** GET /api/admin/politicas-cancelacion/cine/:idCine */
  listByCine(idCine: string): Observable<PoliticaCancelacion[]> {
    const filtered = MOCK_POLITICAS_CANCELACION.filter((p) => p.id_cine === idCine);
    return of(filtered.length ? [...filtered] : [...MOCK_POLITICAS_CANCELACION]).pipe(delay(120));
  }

  /** GET /api/admin/politicas-cancelacion/:id/reglas */
  listReglas(idPolitica: string): Observable<ReglaPolitica[]> {
    const filtered = MOCK_REGLAS_POLITICA.filter((r) => r.id_politica === idPolitica);
    return of([...filtered]).pipe(delay(120));
  }

  /** PUT /api/admin/politicas-cancelacion/:id/reglas — bulk replace */
  saveReglas(idPolitica: string, reglas: ReglaPolitica[]): Observable<ReglaPolitica[]> {
    return of([...reglas]).pipe(delay(120));
  }

  /** PATCH /api/admin/politicas-cancelacion/:id/activa */
  setActiva(id: string, activa: boolean): Observable<PoliticaCancelacion> {
    const found = MOCK_POLITICAS_CANCELACION.find((p) => p.id === id) ?? MOCK_POLITICAS_CANCELACION[0]!;
    return of({ ...found, activa }).pipe(delay(120));
  }

  create(input: CrearPoliticaInput): Observable<PoliticaCancelacion> {
    const nueva: PoliticaCancelacion = {
      id: `pol-${Date.now()}`,
      id_cine: input.id_cine,
      nombre: input.nombre,
      activa: false,
      created_at: new Date().toISOString(),
    };
    return of({ ...nueva }).pipe(delay(120));
  }

  update(id: string, input: EditarPoliticaInput): Observable<PoliticaCancelacion> {
    const found = MOCK_POLITICAS_CANCELACION.find((p) => p.id === id) ?? MOCK_POLITICAS_CANCELACION[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }
}
