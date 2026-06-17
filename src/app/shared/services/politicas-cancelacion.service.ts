import { Observable } from 'rxjs';

// Espejo de model PoliticaCancelacion en api/prisma/schema.prisma
export type PoliticaCancelacion = {
  id: string;
  id_cine: string;
  nombre: string;
  activa: boolean;
  created_at: string;
};

export abstract class PoliticasCancelacionService {
  abstract list(): Observable<PoliticaCancelacion[]>;
  abstract getById(id: string): Observable<PoliticaCancelacion | undefined>;
}
