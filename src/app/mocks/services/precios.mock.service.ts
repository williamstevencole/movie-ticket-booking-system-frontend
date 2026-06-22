import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  GuardarMatrizInput,
  PrecioCineRow,
  PreciosMatriz,
  PreciosService,
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
  // Columnas = tipos de asiento activos (orden del catálogo).
  private readonly tipos = MOCK_TIPOS_ASIENTO.filter((t) => t.activo).map(
    (t) => ({ id: t.id, nombre: t.nombre, color: t.color }),
  );

  private defaults: Record<string, number | null> = this.seedDefaults();
  private cines: PrecioCineRow[] = this.seedCines();

  override getMatriz(): Observable<PreciosMatriz> {
    return of(this.snapshot());
  }

  override guardar(input: GuardarMatrizInput): Observable<PreciosMatriz> {
    // Validación: todo precio definido debe ser > 0.
    const bad = (v: number | null) => v !== null && !(v > 0);
    if (this.tipos.some((t) => bad(input.defaults[t.id] ?? null))) {
      return throwError(() => ({
        code: 'BAD_DEFAULT',
        message: 'Los precios por defecto deben ser mayores a 0',
      }));
    }
    for (const row of input.cines) {
      if (this.tipos.some((t) => bad(row.precios[t.id] ?? null))) {
        return throwError(() => ({
          code: 'BAD_PRICE',
          message: 'Cada precio debe ser mayor a 0',
        }));
      }
    }

    this.defaults = { ...this.normalizeRow(input.defaults) };
    const byId = new Map(input.cines.map((c) => [c.cineId, c.precios]));
    this.cines = this.cines.map((row) =>
      byId.has(row.cineId)
        ? { ...row, precios: this.normalizeRow(byId.get(row.cineId)!) }
        : row,
    );

    return of(this.snapshot());
  }

  // ── helpers ──

  private snapshot(): PreciosMatriz {
    return {
      tipos: this.tipos.map((t) => ({ ...t })),
      defaults: { ...this.defaults },
      cines: this.cines.map((c) => ({ ...c, precios: { ...c.precios } })),
    };
  }

  private normalizeRow(
    src: Record<string, number | null>,
  ): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const t of this.tipos) out[t.id] = src[t.id] ?? null;
    return out;
  }

  private seedDefaults(): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const t of this.tipos) out[t.id] = MOCK_PRECIOS_DEFAULTS[t.id] ?? null;
    return out;
  }

  private seedCines(): PrecioCineRow[] {
    const ciudadById = new Map(MOCK_CIUDADES.map((c) => [c.id, c.nombre]));
    return MOCK_CINES.map((cine) => {
      const overrides = MOCK_PRECIOS_OVERRIDES[cine.id] ?? {};
      const precios: Record<string, number | null> = {};
      for (const t of this.tipos) precios[t.id] = overrides[t.id] ?? null;
      return {
        cineId: cine.id,
        cineNombre: cine.nombre,
        ciudad: ciudadById.get(cine.id_ciudad) ?? '—',
        precios,
      };
    });
  }
}
