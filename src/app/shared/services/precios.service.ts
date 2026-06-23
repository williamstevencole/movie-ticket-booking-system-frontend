import { Observable } from 'rxjs';

// ── Schema-aligned flat type ────────────────────────────────────────────────

export type PrecioCine = {
  id: string;
  id_cine: string;
  id_tipo_asiento: string;
  precio: number;
};

// ── Backwards-compat view types (used by admin/precios matrix UI) ───────────

/** A column in the matrix: one active seat type. */
export type PrecioTipoCol = {
  id: string;
  nombre: string;
  color: string;
};

/** A row in the matrix: one cinema with its price overrides per type. */
export type PrecioCineRow = {
  cineId: string;
  cineNombre: string;
  ciudad: string;
  /** tipoId -> price override; null = inherits the "Por defecto" price. */
  precios: Record<string, number | null>;
};

export type PreciosMatriz = {
  tipos: PrecioTipoCol[];
  /** tipoId -> default price; null = no default defined. */
  defaults: Record<string, number | null>;
  cines: PrecioCineRow[];
};

export type GuardarMatrizInput = {
  defaults: Record<string, number | null>;
  cines: { cineId: string; precios: Record<string, number | null> }[];
};

// ── Abstract service ────────────────────────────────────────────────────────

export abstract class PreciosService {
  /** Return all precio records as a flat array (schema shape). */
  abstract listar(): Observable<PrecioCine[]>;

  /** Return only records for a given cine. */
  abstract listarPorCine(idCine: string): Observable<PrecioCine[]>;

  /**
   * Create or update a precio record.
   * If a record for (id_cine, id_tipo_asiento) already exists it is updated;
   * otherwise a new one is created.
   */
  abstract upsert(item: {
    id_cine: string;
    id_tipo_asiento: string;
    precio: number;
  }): Observable<PrecioCine>;

  /** Delete a precio record by id. */
  abstract borrar(id: string): Observable<void>;

  /**
   * Backwards-compatible helper kept for the admin matrix UI.
   * Consumers should prefer listar() + pivot in the component.
   * Default implementation is provided here; mock and real services
   * may override it for performance if needed.
   */
  abstract getMatriz(): Observable<PreciosMatriz>;

  /**
   * Backwards-compatible save helper for the admin matrix UI.
   * Implementations should translate to multiple upsert / borrar calls.
   */
  abstract guardar(input: GuardarMatrizInput): Observable<PreciosMatriz>;

  /** Derive the minimum precio for a given cine from a flat list. */
  static getMinPrecioForCine(
    precios: PrecioCine[],
    idCine: string,
  ): number | null {
    const filtered = precios.filter((p) => p.id_cine === idCine);
    if (filtered.length === 0) return null;
    return Math.min(...filtered.map((p) => p.precio));
  }
}
