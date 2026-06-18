import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CrearPoliticaInput,
  EditarPoliticaInput,
  PoliticaCancelacion,
  PoliticasCancelacionService,
  ReglaPolitica,
} from '../../shared/services/politicas-cancelacion.service';
import { MOCK_POLITICAS_CANCELACION } from '../data/politicas-cancelacion.mock';
import { MOCK_REGLAS_POLITICA } from '../data/reglas-politica-cancelacion.mock';

@Injectable()
export class MockPoliticasCancelacionService extends PoliticasCancelacionService {
  private politicas: PoliticaCancelacion[] = [...MOCK_POLITICAS_CANCELACION];
  private reglas: ReglaPolitica[] = [...MOCK_REGLAS_POLITICA];

  override list(): Observable<PoliticaCancelacion[]> {
    return of([...this.politicas]);
  }

  override getById(id: string): Observable<PoliticaCancelacion | undefined> {
    return of(this.politicas.find((p) => p.id === id));
  }

  override listByCine(idCine: string): Observable<PoliticaCancelacion[]> {
    return of(this.politicas.filter((p) => p.id_cine === idCine));
  }

  override listReglas(idPolitica: string): Observable<ReglaPolitica[]> {
    return of(this.reglas.filter((r) => r.id_politica === idPolitica));
  }

  override saveReglas(
    idPolitica: string,
    reglas: ReglaPolitica[],
  ): Observable<ReglaPolitica[]> {
    // Reemplaza las reglas de esta política
    this.reglas = [
      ...this.reglas.filter((r) => r.id_politica !== idPolitica),
      ...reglas,
    ];
    return of(reglas);
  }

  override create(input: CrearPoliticaInput): Observable<PoliticaCancelacion> {
    const nueva: PoliticaCancelacion = {
      id: `p-${Date.now()}`,
      id_cine: input.id_cine,
      nombre: input.nombre,
      activa: true,
      created_at: new Date().toISOString(),
    };
    this.politicas = [...this.politicas, nueva];
    return of(nueva);
  }

  override update(
    id: string,
    input: EditarPoliticaInput,
  ): Observable<PoliticaCancelacion> {
    const index = this.politicas.findIndex((p) => p.id === id);
    if (index === -1) {
      // Devuelve el objeto vacío — el componente deberá manejar el caso
      return of({} as PoliticaCancelacion);
    }
    const updated: PoliticaCancelacion = {
      ...this.politicas[index],
      ...input,
    };
    this.politicas[index] = updated;
    return of(updated);
  }
}
