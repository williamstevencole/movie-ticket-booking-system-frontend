import { Observable } from 'rxjs';

// ─── tipos ────────────────────────────────────────────────────
export type Ciudad = {
  id: string;
  nombre: string;
  created_at: string;
};

/**
 * Contrato del service de ciudades. Los componentes dependen de esta
 * abstracta — no de una implementación concreta. La elección entre
 * mock e HTTP se hace en `core/config/data-providers.ts` con el flag
 * `USE_MOCKS`.
 */
export abstract class CiudadesService {
  abstract list(): Observable<Ciudad[]>;
}
