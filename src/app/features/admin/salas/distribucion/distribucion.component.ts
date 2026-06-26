import {
  Component,
  DestroyRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  LucideCheck,
  LucideGrid3x3,
  LucideInfo,
  LucidePalette,
  LucideRefreshCw,
  LucideSave,
  LucideTriangleAlert,
  LucideUndo2,
  LucideX,
} from '@lucide/angular';

import { CinesService } from '../../../../shared/services/cines.service';
import {
  AsignacionInput,
  Sala,
  SalaAsiento,
  SalasService,
} from '../../../../shared/services/salas.service';
import {
  TipoAsiento,
  TiposAsientoService,
} from '../../../../shared/services/tipos-asiento.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { extractMessage } from '../../../../shared/utils/http-errors';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

type GridCell = {
  asiento: SalaAsiento;
  tipoId: string;
  isPending: boolean;
};
type GridRow = { label: string; cells: GridCell[] };

@Component({
  selector: 'app-admin-sala-distribucion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    LucideCheck,
    LucideGrid3x3,
    LucideInfo,
    LucidePalette,
    LucideRefreshCw,
    LucideSave,
    LucideTriangleAlert,
    LucideUndo2,
    LucideX,
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
              <a routerLink="/admin/salas">Salas</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Distribución</span>
            </div>

            <div class="head-row">
              <div class="head-id">
                @if (sala(); as s) {
                  <h1>{{ s.nombre }}</h1>
                  <p class="lead">
                    {{ cineNombre() || '—' }} ·
                    <span class="tnum">{{ s.filas }} × {{ s.columnas }}</span>
                    ·
                    <span class="tnum">{{ s.filas * s.columnas }}</span>
                    asientos
                  </p>
                } @else if (loading()) {
                  <div class="skel skel-title"></div>
                  <div class="skel skel-lead"></div>
                }
              </div>

              <div class="head-actions">
                @if (sala()) {
                  <a
                    class="btn"
                    [routerLink]="['/admin/salas', idCine, idSala, 'editar']"
                  >
                    <svg lucideGrid3x3 [size]="16"></svg>
                    <span>Editar grilla</span>
                  </a>
                }
              </div>
            </div>
          </header>

          @if (loadError(); as msg) {
            <div class="error-banner">
              <span>{{ msg }}</span>
              <button type="button" (click)="reload()">
                <svg lucideRefreshCw [size]="14"></svg>
                Reintentar
              </button>
            </div>
          }

          @if (lastWarning(); as warning) {
            <div class="warning-banner" role="status" aria-live="polite">
              <svg lucideTriangleAlert [size]="16"></svg>
              <span class="warning-text">{{ warning }}</span>
              <button
                type="button"
                class="warning-close"
                (click)="dismissWarning()"
                aria-label="Descartar aviso"
              >
                <svg lucideX [size]="14"></svg>
              </button>
            </div>
          }

          <!-- Palette of tipos -->
          <section class="palette card" aria-label="Paleta de tipos de asiento">
            <div class="palette-head">
              <span class="palette-title">
                <svg lucidePalette [size]="14"></svg>
                Tipo a aplicar
              </span>
              <span class="palette-hint">
                Selecciona un tipo y haz click en los asientos para reasignar.
              </span>
            </div>

            <div class="chips">
              @if (loading() && tipos().length === 0) {
                @for (i of [1,2,3,4]; track i) {
                  <span class="chip skel-chip"></span>
                }
              } @else if (tipos().length === 0) {
                <span class="palette-empty">
                  No hay tipos de asiento configurados.
                </span>
              } @else {
                @for (t of tipos(); track t.id) {
                  <button
                    type="button"
                    class="chip"
                    [class.on]="selectedTipoId() === t.id"
                    [style.--chip-color]="tipoColor(t)"
                    (click)="selectTipo(t.id)"
                  >
                    <span class="chip-dot"></span>
                    <span class="chip-name">{{ t.nombre }}</span>
                    <span class="chip-count tnum">
                      {{ countByType().get(t.id) ?? 0 }}
                    </span>
                  </button>
                }
              }
            </div>
          </section>

          <!-- Stage / seat editor -->
          <section class="stage card" aria-label="Editor de asientos">
            <div class="screen-zone">
              <div class="screen-bar"></div>
              <div class="screen-lbl">P A N T A L L A</div>
            </div>

            @if (loading() && asientos().length === 0) {
              <div class="seats">
                @for (row of skeletonRows(); track $index) {
                  <div class="seat-row">
                    <span class="row-lbl skel-lbl"></span>
                    @for (col of row; track $index) {
                      <span class="seat seat-skel"></span>
                    }
                    <span class="row-lbl skel-lbl"></span>
                  </div>
                }
              </div>
            } @else if (gridRows().length === 0 && !loadError()) {
              <div class="empty-grid">
                <svg lucideInfo [size]="20"></svg>
                <p>Esta sala aún no tiene asientos generados.</p>
              </div>
            } @else {
              <div class="seats">
                @for (row of gridRows(); track row.label) {
                  <div class="seat-row">
                    <span class="row-lbl">{{ row.label }}</span>
                    @for (cell of row.cells; track cell.asiento.id) {
                      <button
                        type="button"
                        class="seat"
                        [class.pending]="cell.isPending"
                        [style.--seat-color]="tipoColorById(cell.tipoId)"
                        [attr.aria-label]="cell.asiento.codigo + ' · ' + tipoNameById(cell.tipoId)"
                        [title]="cell.asiento.codigo + ' — ' + tipoNameById(cell.tipoId)"
                        (click)="onSeatClick(cell.asiento)"
                      ></button>
                    }
                    <span class="row-lbl">{{ row.label }}</span>
                  </div>
                }
              </div>
            }

            <!-- Live legend -->
            @if (tipos().length > 0 && !loading()) {
              <div class="legend">
                @for (t of tipos(); track t.id) {
                  <span class="legend-item">
                    <span
                      class="legend-sw"
                      [style.background]="tipoColor(t)"
                    ></span>
                    <span class="legend-name">{{ t.nombre }}</span>
                    <span class="legend-count tnum">
                      {{ countByType().get(t.id) ?? 0 }}
                    </span>
                  </span>
                }
                <span class="legend-item legend-total">
                  <span class="legend-name">Total</span>
                  <span class="legend-count tnum">{{ asientos().length }}</span>
                </span>
              </div>
            }
          </section>

          <!-- Action bar -->
          @if (!loadError() && asientos().length > 0) {
            <div class="action-bar" [class.dirty]="pendingCount() > 0">
              <div class="action-status">
                @if (pendingCount() > 0) {
                  <span class="dirty-dot" aria-hidden="true"></span>
                  <span class="dirty-text">
                    <strong class="tnum">{{ pendingCount() }}</strong>
                    {{ pendingCount() === 1 ? 'cambio pendiente' : 'cambios pendientes' }}
                  </span>
                } @else if (lastSavedLabel()) {
                  <svg lucideCheck [size]="14"></svg>
                  <span class="saved-text">Guardado · {{ lastSavedLabel() }}</span>
                } @else {
                  <svg lucideInfo [size]="14"></svg>
                  <span class="hint-text">
                    Sin cambios. Selecciona un tipo y pulsa en los asientos para editar.
                  </span>
                }
              </div>

              <div class="action-buttons">
                @if (pendingCount() > 0) {
                  <button
                    type="button"
                    class="btn btn-ghost"
                    [disabled]="saving()"
                    (click)="discardChanges()"
                  >
                    <svg lucideUndo2 [size]="15"></svg>
                    Descartar
                  </button>
                }
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="saving() || pendingCount() === 0"
                  (click)="save()"
                >
                  <svg lucideSave [size]="15"></svg>
                  {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
                </button>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './distribucion.component.scss',
})
export class AdminSalaDistribucionComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private cinesSvc = inject(CinesService);
  private salasSvc = inject(SalasService);
  private tiposAsientoSvc = inject(TiposAsientoService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly idCine = this.route.snapshot.paramMap.get('cineId') ?? '';
  readonly idSala = this.route.snapshot.paramMap.get('salaId') ?? '';

  // ── State ───────────────────────────────────────────────────────
  readonly loading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly sala = signal<Sala | null>(null);
  readonly cineNombre = signal<string>('');
  readonly asientos = signal<SalaAsiento[]>([]);
  readonly tipos = signal<TipoAsiento[]>([]);
  readonly selectedTipoId = signal<string | null>(null);
  readonly assignments = signal<Map<string, string>>(new Map());
  readonly saving = signal<boolean>(false);
  readonly lastSaveAt = signal<Date | null>(null);
  readonly lastWarning = signal<string | null>(null);

  // Ticks every second so the "Guardado · hace Xs" label refreshes.
  readonly nowTick = signal<number>(Date.now());
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  // ── Indices ─────────────────────────────────────────────────────
  private readonly tipoById = computed<Map<string, TipoAsiento>>(() => {
    const map = new Map<string, TipoAsiento>();
    for (const t of this.tipos()) map.set(t.id, t);
    return map;
  });

  // ── Computeds ───────────────────────────────────────────────────
  readonly pendingCount = computed<number>(() => this.assignments().size);

  readonly gridRows = computed<GridRow[]>(() => {
    const list = this.asientos();
    if (list.length === 0) return [];
    const pend = this.assignments();
    const grouped = new Map<string, SalaAsiento[]>();
    for (const a of list) {
      const arr = grouped.get(a.fila) ?? [];
      arr.push(a);
      grouped.set(a.fila, arr);
    }
    const labels = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
    return labels.map((label) => {
      const seats = (grouped.get(label) ?? []).sort(
        (a, b) => a.columna - b.columna,
      );
      return {
        label,
        cells: seats.map<GridCell>((a) => {
          const override = pend.get(a.id);
          const effective = override ?? a.id_tipo_asiento;
          return {
            asiento: a,
            tipoId: effective,
            isPending: override !== undefined,
          };
        }),
      };
    });
  });

  readonly countByType = computed<Map<string, number>>(() => {
    const list = this.asientos();
    const pend = this.assignments();
    const counts = new Map<string, number>();
    for (const a of list) {
      const eff = pend.get(a.id) ?? a.id_tipo_asiento;
      counts.set(eff, (counts.get(eff) ?? 0) + 1);
    }
    return counts;
  });

  readonly skeletonRows = computed<number[][]>(() => {
    const s = this.sala();
    const rows = s?.filas ?? 5;
    const cols = s?.columnas ?? 8;
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, (_, i) => i),
    );
  });

  readonly lastSavedLabel = computed<string | null>(() => {
    const at = this.lastSaveAt();
    if (!at) return null;
    const now = this.nowTick();
    const diffSec = Math.max(0, Math.floor((now - at.getTime()) / 1000));
    if (diffSec < 5) return 'hace un momento';
    if (diffSec < 60) return `hace ${diffSec}s`;
    const mins = Math.floor(diffSec / 60);
    return mins === 1 ? 'hace 1 min' : `hace ${mins} min`;
  });

  constructor() {
    // Default selected tipo to first available once tipos load.
    effect(() => {
      const list = this.tipos();
      if (list.length > 0 && this.selectedTipoId() === null) {
        this.selectedTipoId.set(list[0]!.id);
      }
    });

    this.fetchAll();

    this.tickHandle = setInterval(() => {
      if (this.lastSaveAt()) this.nowTick.set(Date.now());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  // ── Data loading ────────────────────────────────────────────────
  private fetchAll(): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      sala: this.salasSvc.getById(this.idSala),
      cine: this.cinesSvc.getById(this.idCine),
      asientos: this.salasSvc.listAsientos(this.idSala),
      tipos: this.tiposAsientoSvc.list(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ sala, cine, asientos, tipos }) => {
        this.sala.set(sala);
        this.cineNombre.set(cine.nombre);
        this.asientos.set(asientos);
        this.tipos.set(tipos);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.assignments.set(new Map());
    this.fetchAll();
  }

  // ── Interactions ────────────────────────────────────────────────
  selectTipo(id: string): void {
    this.selectedTipoId.set(id);
  }

  onSeatClick(asiento: SalaAsiento): void {
    const tipoId = this.selectedTipoId();
    if (!tipoId) {
      this.toast.show('Selecciona primero un tipo en la paleta.');
      return;
    }

    const original = asiento.id_tipo_asiento;
    const next = new Map(this.assignments());

    if (tipoId === original) {
      // Revert: no-op diff.
      next.delete(asiento.id);
    } else {
      next.set(asiento.id, tipoId);
    }

    this.assignments.set(next);
  }

  discardChanges(): void {
    this.assignments.set(new Map());
  }

  dismissWarning(): void {
    this.lastWarning.set(null);
  }

  save(): void {
    const pending = this.assignments();
    if (pending.size === 0 || this.saving()) return;

    const payload: AsignacionInput[] = [...pending.entries()].map(
      ([id_asiento, id_tipo_asiento]) => ({ id_asiento, id_tipo_asiento }),
    );
    const count = pending.size;

    this.saving.set(true);
    this.salasSvc.updateAsientos(this.idSala, payload).subscribe({
      next: (res) => {
        if (res.warning) {
          this.lastWarning.set(res.warning);
        } else {
          this.lastWarning.set(null);
          this.toast.show(
            `${count} ${count === 1 ? 'asiento actualizado' : 'asientos actualizados'}`,
          );
        }
        // Refetch source of truth so the grid reflects the persisted state.
        this.salasSvc.listAsientos(this.idSala).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (fresh) => {
            this.asientos.set(fresh);
            this.assignments.set(new Map());
            this.lastSaveAt.set(new Date());
            this.nowTick.set(Date.now());
            this.saving.set(false);
          },
          error: (err) => {
            this.toast.show(extractMessage(err));
            this.saving.set(false);
          },
        });
      },
      error: (err) => {
        this.toast.show(extractMessage(err));
        this.saving.set(false);
      },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────
  tipoColor(t: TipoAsiento): string {
    const color = t.color?.trim();
    return color ? color : 'var(--surface-2)';
  }

  tipoColorById(id: string): string {
    const t = this.tipoById().get(id);
    return t ? this.tipoColor(t) : 'var(--surface-2)';
  }

  tipoNameById(id: string): string {
    return this.tipoById().get(id)?.nombre ?? 'Sin tipo';
  }
}
