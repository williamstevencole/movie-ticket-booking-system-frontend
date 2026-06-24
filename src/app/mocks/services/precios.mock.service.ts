import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  GuardarMatrizInput,
  PrecioCine,
  PrecioCineRow,
  PreciosMatriz,
  PreciosService,
  PrecioTipoCol,
} from '../../shared/services/precios.service';
import { MOCK_CINES } from '../data/cines.mock';
import { MOCK_CIUDADES } from '../data/ciudades.mock';
import { MOCK_TIPOS_ASIENTO } from '../data/tipos-asiento.mock';
import {
  MOCK_PRECIOS_DEFAULTS,
  MOCK_PRECIOS_OVERRIDES,
} from '../data/precios.mock';

@Injectable()
export class MockPreciosService extends PreciosService {
  // ── Flat in-memory store (schema shape) ────────────────────────────────

  private store: PrecioCine[] = this.seed();

  // ── Derived catalogue helpers ──────────────────────────────────────────

  /** Active seat type columns (sorted by catalogue order). */
  private readonly tiposCols: PrecioTipoCol[] = MOCK_TIPOS_ASIENTO.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    color: t.color ?? '#000000',
  }));

  /** City name lookup by city id. */
  private readonly ciudadById = new Map(
    MOCK_CIUDADES.map((c) => [c.id, c.nombre]),
  );

  // ── PreciosService implementation ──────────────────────────────────────

  override listar(): Observable<PrecioCine[]> {
    return of(this.store.map((p) => ({ ...p })));
  }

  override listarPorCine(idCine: string): Observable<PrecioCine[]> {
    return of(
      this.store.filter((p) => p.id_cine === idCine).map((p) => ({ ...p })),
    );
  }

  // ── Backwards-compat matrix API (admin/precios UI) ─────────────────────

  override getMatriz(): Observable<PreciosMatriz> {
    return of(this.buildMatriz());
  }

  override guardar(input: GuardarMatrizInput): Observable<PreciosMatriz> {
    // Validate: every defined price must be > 0.
    const bad = (v: number | null) => v !== null && !(v > 0);

    if (this.tiposCols.some((t) => bad(input.defaults[t.id] ?? null))) {
      return throwError(() => ({
        code: 'BAD_DEFAULT',
        message: 'Los precios por defecto deben ser mayores a 0',
      }));
    }
    for (const row of input.cines) {
      if (this.tiposCols.some((t) => bad(row.precios[t.id] ?? null))) {
        return throwError(() => ({
          code: 'BAD_PRICE',
          message: 'Cada precio debe ser mayor a 0',
        }));
      }
    }

    // Apply defaults row (cineId = 'default').
    for (const t of this.tiposCols) {
      const precio = input.defaults[t.id] ?? null;
      if (precio !== null) {
        this.applyUpsert('default', t.id, precio);
      } else {
        this.applyBorrar('default', t.id);
      }
    }

    // Apply per-cine overrides.
    for (const row of input.cines) {
      for (const t of this.tiposCols) {
        const precio = row.precios[t.id] ?? null;
        if (precio !== null) {
          this.applyUpsert(row.cineId, t.id, precio);
        } else {
          this.applyBorrar(row.cineId, t.id);
        }
      }
    }

    return of(this.buildMatriz());
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private applyUpsert(idCine: string, idTipo: string, precio: number): void {
    const existing = this.store.find(
      (p) => p.id_cine === idCine && p.id_tipo_asiento === idTipo,
    );
    if (existing) {
      existing.precio = precio;
    } else {
      this.store = [
        ...this.store,
        {
          id: `${idCine}__${idTipo}`,
          id_cine: idCine,
          id_tipo_asiento: idTipo,
          precio,
        },
      ];
    }
  }

  private applyBorrar(idCine: string, idTipo: string): void {
    this.store = this.store.filter(
      (p) => !(p.id_cine === idCine && p.id_tipo_asiento === idTipo),
    );
  }

  /**
   * Build a PreciosMatriz view by pivoting the flat store.
   * The 'default' pseudo-cine row holds the catalogue defaults.
   */
  private buildMatriz(): PreciosMatriz {
    const tipos = this.tiposCols.map((t) => ({ ...t }));

    // Defaults row (id_cine === 'default').
    const defaults: Record<string, number | null> = {};
    for (const t of tipos) {
      const rec = this.store.find(
        (p) => p.id_cine === 'default' && p.id_tipo_asiento === t.id,
      );
      defaults[t.id] = rec ? rec.precio : null;
    }

    // Per-cine rows (exclude the 'default' pseudo-cine).
    const cines: PrecioCineRow[] = MOCK_CINES.map((cine) => {
      const precios: Record<string, number | null> = {};
      for (const t of tipos) {
        const rec = this.store.find(
          (p) => p.id_cine === cine.id && p.id_tipo_asiento === t.id,
        );
        precios[t.id] = rec ? rec.precio : null;
      }
      return {
        cineId: cine.id,
        cineNombre: cine.nombre,
        ciudad: this.ciudadById.get(cine.id_ciudad) ?? '—',
        precios,
      };
    });

    return { tipos, defaults, cines };
  }

  /** Seed the flat store from MOCK_PRECIOS_DEFAULTS and MOCK_PRECIOS_OVERRIDES. */
  private seed(): PrecioCine[] {
    const items: PrecioCine[] = [];
    const activeTipos = MOCK_TIPOS_ASIENTO;

    // Default row (id_cine = 'default').
    for (const t of activeTipos) {
      const precio = MOCK_PRECIOS_DEFAULTS[t.id];
      if (precio !== undefined) {
        items.push({
          id: `default__${t.id}`,
          id_cine: 'default',
          id_tipo_asiento: t.id,
          precio,
        });
      }
    }

    // Per-cine overrides.
    for (const cine of MOCK_CINES) {
      const overrides = MOCK_PRECIOS_OVERRIDES[cine.id] ?? {};
      for (const t of activeTipos) {
        const precio = overrides[t.id];
        if (precio !== undefined) {
          items.push({
            id: `${cine.id}__${t.id}`,
            id_cine: cine.id,
            id_tipo_asiento: t.id,
            precio,
          });
        }
      }
    }

    return items;
  }
}
