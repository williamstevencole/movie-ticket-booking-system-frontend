import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

// ── Schema-aligned flat type ────────────────────────────────────────────────

export type PrecioCine = {
  id: string;
  id_cine: string;
  id_tipo_asiento: string;
  precio: number;
};

// ── Backend matrix response type ─────────────────────────────────────────────
// Matches GET /admin/precios/matriz exactly (confirmed Task 0 gap analysis)

export type BackendPreciosMatriz = {
  tipos_asiento: Array<{ id: string; nombre: string; color?: string }>;
  defaults: Record<string, number | null>;
  cines: Array<{
    id: string;
    nombre: string;
    ciudad: string;
    precios: Record<string, number | null>;
  }>;
};

// ── Backend flat precio-cine item (GET /admin/precios/cine/:id) ──────────────

type BackendPrecioCineItem = {
  id: string;
  id_cine: string;
  id_tipo_asiento: string;
  precio: string | number;
  tipo_asiento?: { id: string; nombre: string; color?: string };
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

// ── Pure mappers ─────────────────────────────────────────────────────────────

/** Coerce backend precio string "100" or number 100 to number. */
function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

/**
 * Maps BackendPreciosMatriz → PreciosMatriz.
 * Field renames: tipos_asiento → tipos, cine id → cineId, nombre → cineNombre.
 */
function mapBackendMatriz(res: BackendPreciosMatriz): PreciosMatriz {
  return {
    tipos: res.tipos_asiento.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      color: t.color ?? '#6B7280',
    })),
    defaults: { ...res.defaults },
    cines: res.cines.map((c) => ({
      cineId: c.id,
      cineNombre: c.nombre,
      ciudad: c.ciudad,
      precios: Object.fromEntries(
        Object.entries(c.precios).map(([k, v]) => [k, v === null ? null : toNum(v)]),
      ),
    })),
  };
}

/**
 * Reverse-maps GuardarMatrizInput → GuardarMatrizDto body.
 * Frontend uses cineId; DTO accepts id_cine (or id).
 * precio strings coerced to number before sending.
 */
function mapInputToDto(input: GuardarMatrizInput): object {
  return {
    defaults: input.defaults,
    cines: input.cines.map((c) => ({
      id_cine: c.cineId,
      precios: c.precios,
    })),
  };
}

// ── Concrete service ────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PreciosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/precios`;

  /** GET /api/admin/precios/matriz */
  getMatriz(): Observable<PreciosMatriz> {
    return this.http
      .get<BackendPreciosMatriz>(`${this.base}/matriz`)
      .pipe(map(mapBackendMatriz));
  }

  /** POST /api/admin/precios/matriz — saves and returns the updated matrix */
  guardar(input: GuardarMatrizInput): Observable<PreciosMatriz> {
    return this.http
      .post<BackendPreciosMatriz>(`${this.base}/matriz`, mapInputToDto(input))
      .pipe(map(mapBackendMatriz));
  }

  /** GET /api/admin/precios/cine/:idCine */
  listarPorCine(idCine: string): Observable<PrecioCine[]> {
    return this.http
      .get<BackendPrecioCineItem[]>(`${this.base}/cine/${idCine}`)
      .pipe(
        map((items) =>
          items.map((item) => ({
            id: item.id,
            id_cine: item.id_cine,
            id_tipo_asiento: item.id_tipo_asiento,
            precio: toNum(item.precio),
          })),
        ),
      );
  }

  /** Derive the minimum precio for a given cine from a flat list. */
  static getMinPrecioForCine(precios: PrecioCine[], idCine: string): number | null {
    const filtered = precios.filter((p) => p.id_cine === idCine);
    if (filtered.length === 0) return null;
    return Math.min(...filtered.map((p) => p.precio));
  }
}
