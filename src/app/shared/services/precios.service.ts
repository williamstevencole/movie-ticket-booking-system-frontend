import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CINES } from '../../mocks/data/cines.mock';
import { MOCK_PRECIOS_DEFAULTS, MOCK_PRECIOS_OVERRIDES } from '../../mocks/data/precios.mock';

// ── Schema-aligned flat type ────────────────────────────────────────────────

export type PrecioCine = {
  id: string;
  id_cine: string;
  id_tipo_asiento: string;
  precio: number;
};

// ── Backend matrix response type (Task 18 shape) ────────────────────────────

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

const MOCK_TIPOS: PrecioTipoCol[] = [
  { id: 'std', nombre: 'Estándar', color: '#6B7280' },
  { id: 'vip', nombre: 'VIP', color: '#F59E0B' },
  { id: 'acc', nombre: 'Accesible', color: '#3B82F6' },
];

function buildMatriz(): PreciosMatriz {
  const cineRows: PrecioCineRow[] = MOCK_CINES.slice(0, 8).map((c) => ({
    cineId: c.id,
    cineNombre: c.nombre,
    ciudad: c.id_ciudad,
    precios: { ...(MOCK_PRECIOS_OVERRIDES[c.id] ?? {}) },
  }));
  return {
    tipos: MOCK_TIPOS,
    defaults: { ...MOCK_PRECIOS_DEFAULTS },
    cines: cineRows,
  };
}

// ── Concrete service ────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PreciosService {
  /** GET /api/admin/precios/matriz */
  getMatriz(): Observable<PreciosMatriz> {
    return of(buildMatriz()).pipe(delay(120));
  }

  /** POST /api/admin/precios/matriz */
  guardar(input: GuardarMatrizInput): Observable<PreciosMatriz> {
    // Echo back the input shaped as PreciosMatriz
    const resultado: PreciosMatriz = {
      tipos: MOCK_TIPOS,
      defaults: { ...input.defaults },
      cines: input.cines.map((c) => {
        const cine = MOCK_CINES.find((mc) => mc.id === c.cineId);
        return {
          cineId: c.cineId,
          cineNombre: cine?.nombre ?? c.cineId,
          ciudad: cine?.id_ciudad ?? '',
          precios: { ...c.precios },
        };
      }),
    };
    return of(resultado).pipe(delay(120));
  }

  /** GET /api/admin/precios/cine/:idCine */
  listarPorCine(idCine: string): Observable<PrecioCine[]> {
    const overrides = MOCK_PRECIOS_OVERRIDES[idCine] ?? {};
    const items: PrecioCine[] = MOCK_TIPOS.map((t, i) => ({
      id: `pc-${idCine}-${t.id}`,
      id_cine: idCine,
      id_tipo_asiento: t.id,
      precio: overrides[t.id] ?? MOCK_PRECIOS_DEFAULTS[t.id] ?? 75,
    }));
    return of(items).pipe(delay(120));
  }

  /** @deprecated Use getMatriz() + guardar() for matrix UI */
  listar(): Observable<PrecioCine[]> {
    const items: PrecioCine[] = MOCK_CINES.slice(0, 5).flatMap((c) =>
      MOCK_TIPOS.map((t) => ({
        id: `pc-${c.id}-${t.id}`,
        id_cine: c.id,
        id_tipo_asiento: t.id,
        precio: MOCK_PRECIOS_OVERRIDES[c.id]?.[t.id] ?? MOCK_PRECIOS_DEFAULTS[t.id] ?? 75,
      })),
    );
    return of(items).pipe(delay(120));
  }

  /** Derive the minimum precio for a given cine from a flat list. */
  static getMinPrecioForCine(precios: PrecioCine[], idCine: string): number | null {
    const filtered = precios.filter((p) => p.id_cine === idCine);
    if (filtered.length === 0) return null;
    return Math.min(...filtered.map((p) => p.precio));
  }
}
