import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideSave,
  LucideRotateCcw,
  LucideTriangleAlert,
  LucideRefreshCw,
} from '@lucide/angular';

import {
  PrecioCineRow,
  PrecioTipoCol,
  PreciosService,
} from '../../../shared/services/precios.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../shared/utils/http-errors';

type Toast = { kind: 'ok' | 'err'; text: string } | null;

const DEFAULT_KEY = 'default';

/** Placeholder skeleton rows for initial load state. */
const SKELETON_TIPOS: PrecioTipoCol[] = [
  { id: '_s1', nombre: '', color: '#374151' },
  { id: '_s2', nombre: '', color: '#374151' },
  { id: '_s3', nombre: '', color: '#374151' },
];

const SKELETON_CINES: PrecioCineRow[] = Array.from({ length: 5 }, (_, i) => ({
  cineId: `_sk${i}`,
  cineNombre: '',
  ciudad: '',
  precios: {},
}));

@Component({
  selector: 'app-admin-precios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideSave,
    LucideRotateCcw,
    LucideTriangleAlert,
    LucideRefreshCw,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <header class="topbar">
            <div class="crumb">
              <a routerLink="/admin">Admin</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Precios por cine</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Matriz de precios</h1>
                <p class="lead">
                  Precio por cada combinación de cine y tipo de asiento, en
                  lempiras. Deja una celda vacía para heredar el precio
                  <strong>Por defecto</strong>.
                </p>
              </div>
              <div class="head-actions">
                <button
                  class="btn"
                  [disabled]="dirtyCount() === 0 || matrizLoading()"
                  (click)="discard()"
                >
                  <svg lucideRotateCcw [size]="15"></svg>
                  <span>Descartar</span>
                </button>
                <button
                  class="btn btn-primary"
                  [disabled]="!canSave() || matrizLoading()"
                  (click)="save()"
                >
                  <svg lucideSave [size]="16"></svg>
                  <span>Guardar matriz</span>
                </button>
              </div>
            </div>
          </header>

          <!-- Error banner -->
          @if (matrizError(); as errMsg) {
            <div class="error-banner" role="alert">
              <svg lucideTriangleAlert [size]="16"></svg>
              <span>{{ errMsg }}</span>
              <button class="btn-link" (click)="reload()">
                <svg lucideRefreshCw [size]="14"></svg>
                Reintentar
              </button>
            </div>
          }

          <section class="status-bar">
            @if (!matrizLoading() && !matrizError()) {
              @if (dirtyCount() > 0) {
                <span class="chip chip-dirty">
                  {{ dirtyCount() }}
                  {{ dirtyCount() === 1 ? 'cambio sin guardar' : 'cambios sin guardar' }}
                </span>
              } @else {
                <span class="chip chip-clean">Todo guardado</span>
              }
              @if (invalidCount() > 0) {
                <span class="chip chip-err">
                  <svg lucideTriangleAlert [size]="13"></svg>
                  {{ invalidCount() }}
                  {{ invalidCount() === 1 ? 'celda inválida' : 'celdas inválidas' }}
                  (precio &gt; 0)
                </span>
              }
              @if (warningCount() > 0) {
                <span class="chip chip-warn">
                  <svg lucideTriangleAlert [size]="13"></svg>
                  {{ warningCount() }}
                  {{ warningCount() === 1 ? 'cine sin precio' : 'cines sin precio' }}
                  para un tipo activo
                </span>
              }
            }
          </section>

          <section class="card">
            <div class="table-scroll">
              <table class="matriz" [class.skeleton]="matrizLoading()">
                <thead>
                  <tr>
                    <th class="col-cine sticky-l">Cine</th>
                    @for (t of displayTipos(); track t.id) {
                      <th class="col-tipo">
                        @if (matrizLoading()) {
                          <span class="skel-cell"></span>
                        } @else {
                          <span class="tipo-head">
                            <span class="swatch" [style.background]="t.color"></span>
                            <span>{{ t.nombre }}</span>
                          </span>
                        }
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  <!-- Default row -->
                  <tr class="row-default">
                    <td class="col-cine sticky-l">
                      @if (matrizLoading()) {
                        <span class="skel-cell skel-name"></span>
                      } @else {
                        <div class="cine-cell">
                          <span class="nombre">Por defecto</span>
                          <span class="sub">Precio base del catálogo</span>
                        </div>
                      }
                    </td>
                    @for (t of displayTipos(); track t.id) {
                      <td class="col-tipo">
                        @if (matrizLoading()) {
                          <span class="skel-cell skel-price"></span>
                        } @else {
                          <span
                            class="price-input"
                            [class.dirty]="isDirty(DEFAULT_KEY, t.id)"
                            [class.invalid]="isInvalid(DEFAULT_KEY, t.id)"
                          >
                            <span class="cur">L</span>
                            <input
                              type="text"
                              inputmode="decimal"
                              autocomplete="off"
                              placeholder="—"
                              [ngModel]="cellValue(DEFAULT_KEY, t.id)"
                              (ngModelChange)="setCell(DEFAULT_KEY, t.id, $event)"
                            />
                          </span>
                        }
                      </td>
                    }
                  </tr>

                  @for (c of displayCines(); track c.cineId) {
                    <tr>
                      <td class="col-cine sticky-l">
                        @if (matrizLoading()) {
                          <span class="skel-cell skel-name"></span>
                        } @else {
                          <div class="cine-cell">
                            <span class="nombre">{{ c.cineNombre }}</span>
                            <span class="sub">{{ c.ciudad }}</span>
                          </div>
                        }
                      </td>
                      @for (t of displayTipos(); track t.id) {
                        <td class="col-tipo">
                          @if (matrizLoading()) {
                            <span class="skel-cell skel-price"></span>
                          } @else {
                            <span
                              class="price-input"
                              [class.dirty]="isDirty(c.cineId, t.id)"
                              [class.invalid]="isInvalid(c.cineId, t.id)"
                              [class.missing]="isMissing(c.cineId, t.id)"
                            >
                              <span class="cur">L</span>
                              <input
                                type="text"
                                inputmode="decimal"
                                autocomplete="off"
                                [placeholder]="placeholderFor(t.id)"
                                [ngModel]="cellValue(c.cineId, t.id)"
                                (ngModelChange)="setCell(c.cineId, t.id, $event)"
                              />
                            </span>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          @if (!matrizLoading() && !matrizError()) {
            <p class="foot-note">
              Las celdas vacías heredan el precio <strong>Por defecto</strong> de
              su columna. Una celda en ámbar indica un cine sin precio para un tipo
              de asiento activo.
            </p>
          }
        </div>
      </main>
    </div>

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './precios.component.scss',
})
export class AdminPreciosComponent {
  private svc = inject(PreciosService);

  readonly DEFAULT_KEY = DEFAULT_KEY;

  // ── Data signals ────────────────────────────────────────────────────────────

  readonly tipos = signal<PrecioTipoCol[]>([]);
  readonly cines = signal<PrecioCineRow[]>([]);

  // ── UX state signals ─────────────────────────────────────────────────────────

  readonly matrizLoading = signal<boolean>(true);
  readonly matrizError = signal<string | null>(null);

  // ── Edit state ───────────────────────────────────────────────────────────────

  /** `${rowKey}|${tipoId}` -> valor del input (string). */
  readonly draft = signal<Record<string, string>>({});
  readonly baseline = signal<Record<string, string>>({});

  readonly toast = signal<Toast>(null);

  // ── Skeleton-aware display signals ───────────────────────────────────────────

  /** During loading, shows skeleton placeholders; otherwise real data. */
  readonly displayTipos = computed<PrecioTipoCol[]>(() =>
    this.matrizLoading() ? SKELETON_TIPOS : this.tipos(),
  );

  readonly displayCines = computed<PrecioCineRow[]>(() =>
    this.matrizLoading() ? SKELETON_CINES : this.cines(),
  );

  // ── Derived counts ───────────────────────────────────────────────────────────

  readonly dirtyCount = computed(() => {
    const d = this.draft();
    const b = this.baseline();
    let n = 0;
    for (const k of Object.keys(d)) {
      if ((d[k] ?? '').trim() !== (b[k] ?? '').trim()) n++;
    }
    return n;
  });

  readonly invalidCount = computed(() => {
    const d = this.draft();
    let n = 0;
    for (const k of Object.keys(d)) {
      const v = (d[k] ?? '').trim();
      if (v === '') continue;
      const num = Number(v);
      if (!isFinite(num) || num <= 0) n++;
    }
    return n;
  });

  readonly warningCount = computed(() => {
    const tipos = this.tipos();
    const cines = this.cines();
    const d = this.draft();
    let n = 0;
    for (const c of cines) {
      for (const t of tipos) {
        const ov = (d[this.k(c.cineId, t.id)] ?? '').trim();
        const def = (d[this.k(DEFAULT_KEY, t.id)] ?? '').trim();
        if (ov === '' && def === '') n++;
      }
    }
    return n;
  });

  readonly canSave = computed(
    () => this.dirtyCount() > 0 && this.invalidCount() === 0,
  );

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  constructor() {
    this.cargar();
  }

  // ── Public methods ───────────────────────────────────────────────────────────

  /** Reload the matrix from the server (for Reintentar button). */
  reload() {
    this.cargar();
  }

  cellValue(rowKey: string, tipoId: string): string {
    return this.draft()[this.k(rowKey, tipoId)] ?? '';
  }

  setCell(rowKey: string, tipoId: string, value: string) {
    this.draft.update((d) => ({ ...d, [this.k(rowKey, tipoId)]: value }));
  }

  isDirty(rowKey: string, tipoId: string): boolean {
    const key = this.k(rowKey, tipoId);
    return (this.draft()[key] ?? '').trim() !== (this.baseline()[key] ?? '').trim();
  }

  isInvalid(rowKey: string, tipoId: string): boolean {
    const v = (this.draft()[this.k(rowKey, tipoId)] ?? '').trim();
    if (v === '') return false;
    const num = Number(v);
    return !isFinite(num) || num <= 0;
  }

  /** Celda de cine sin override y sin precio por defecto en su columna. */
  isMissing(cineId: string, tipoId: string): boolean {
    const ov = (this.draft()[this.k(cineId, tipoId)] ?? '').trim();
    const def = (this.draft()[this.k(DEFAULT_KEY, tipoId)] ?? '').trim();
    return ov === '' && def === '';
  }

  placeholderFor(tipoId: string): string {
    const def = (this.draft()[this.k(DEFAULT_KEY, tipoId)] ?? '').trim();
    return def === '' ? '—' : def;
  }

  save() {
    if (!this.canSave()) return;
    const d = this.draft();
    const parse = (rowKey: string) => {
      const out: Record<string, number | null> = {};
      for (const t of this.tipos()) {
        const v = (d[this.k(rowKey, t.id)] ?? '').trim();
        out[t.id] = v === '' ? null : Number(v);
      }
      return out;
    };

    this.svc
      .guardar({
        defaults: parse(DEFAULT_KEY),
        cines: this.cines().map((c) => ({
          cineId: c.cineId,
          precios: parse(c.cineId),
        })),
      })
      .subscribe({
        next: (matriz) => {
          this.load(matriz.tipos, matriz.cines, matriz.defaults);
          this.showToast('ok', 'Matriz de precios guardada');
        },
        error: (e) => this.showToast('err', extractMessage(e)),
      });
  }

  discard() {
    this.draft.set({ ...this.baseline() });
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private cargar() {
    this.matrizLoading.set(true);
    this.matrizError.set(null);

    this.svc.getMatriz().subscribe({
      next: (m) => {
        this.load(m.tipos, m.cines, m.defaults);
        this.matrizLoading.set(false);
      },
      error: (e) => {
        this.matrizLoading.set(false);
        this.matrizError.set(extractMessage(e));
      },
    });
  }

  private load(
    tipos: PrecioTipoCol[],
    cines: PrecioCineRow[],
    defaults: Record<string, number | null>,
  ) {
    this.tipos.set(tipos);
    this.cines.set(cines);

    const snap: Record<string, string> = {};
    for (const t of tipos) {
      snap[this.k(DEFAULT_KEY, t.id)] = this.toStr(defaults[t.id]);
    }
    for (const c of cines) {
      for (const t of tipos) {
        snap[this.k(c.cineId, t.id)] = this.toStr(c.precios[t.id]);
      }
    }
    this.draft.set({ ...snap });
    this.baseline.set({ ...snap });
  }

  private toStr(v: number | null | undefined): string {
    return v === null || v === undefined ? '' : String(v);
  }

  private k(rowKey: string, tipoId: string): string {
    return `${rowKey}|${tipoId}`;
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
