import { Observable } from 'rxjs';

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

export abstract class PoliticasCancelacionService {
  abstract list(): Observable<PoliticaCancelacion[]>;
  abstract getById(id: string): Observable<PoliticaCancelacion | undefined>;
  abstract listByCine(idCine: string): Observable<PoliticaCancelacion[]>;
  abstract listReglas(idPolitica: string): Observable<ReglaPolitica[]>;
  abstract saveReglas(
    idPolitica: string,
    reglas: ReglaPolitica[],
  ): Observable<ReglaPolitica[]>;
  abstract create(input: CrearPoliticaInput): Observable<PoliticaCancelacion>;
  abstract update(
    id: string,
    input: EditarPoliticaInput,
  ): Observable<PoliticaCancelacion>;
}
