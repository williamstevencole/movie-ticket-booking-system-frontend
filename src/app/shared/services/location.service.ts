import { Injectable, computed, signal } from '@angular/core';

export type SavedLocation = {
  cityId: string;
  cityName: string;
  cinemaId: string;
  cinemaName: string;
  cinemaAddress: string | null;
};

const STORAGE_KEY = 'cinetario.location';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly _selection = signal<SavedLocation | null>(this.read());

  readonly selection = this._selection.asReadonly();
  readonly hasSelection = computed(() => this._selection() !== null);

  /** Solo el nombre del cine — útil para chips compactos. */
  readonly cinemaName = computed(() => this._selection()?.cinemaName ?? null);

  /** Solo el nombre de la ciudad. */
  readonly cityName = computed(() => this._selection()?.cityName ?? null);

  set(loc: SavedLocation): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    }
    this._selection.set(loc);
  }

  clear(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this._selection.set(null);
  }

  private read(): SavedLocation | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SavedLocation>;
      if (
        typeof parsed.cityId === 'string' &&
        typeof parsed.cityName === 'string' &&
        typeof parsed.cinemaId === 'string' &&
        typeof parsed.cinemaName === 'string'
      ) {
        return {
          cityId: parsed.cityId,
          cityName: parsed.cityName,
          cinemaId: parsed.cinemaId,
          cinemaName: parsed.cinemaName,
          cinemaAddress: parsed.cinemaAddress ?? null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
