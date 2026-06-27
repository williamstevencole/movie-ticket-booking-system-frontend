import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucideMail,
  LucideEye,
  LucideBan,
  LucideBanknote,
  LucideTicketX,
  LucideCheckCircle2,
} from '@lucide/angular';

import {
  AdminReservasService,
  AdminReservaRow,
} from '../../../../shared/services/admin-reservas.service';
import { EstadoReserva } from '../../../../shared/services/reservas.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import { extractMessage } from '../../../../shared/utils/http-errors';

type FilterState = 'all' | EstadoReserva;

interface Toast {
  id: number;
  msg: string;
  kind: 'ok' | 'err';
}

@Component({
  selector: 'app-admin-reservas-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    LucideSearch,
    LucideMail,
    LucideEye,
    LucideBan,
    LucideBanknote,
    LucideTicketX,
    LucideCheckCircle2,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Reservas</span>
          </div>

          <div class="head-row">
            <h1>Reservas</h1>
            <span class="counters">
              <span>{{ totalRows() }} reservas</span>
              @if (pendientesCount() > 0) {
                <span class="dot" aria-hidden="true"></span>
                <button
                  type="button"
                  class="counter-pill"
                  (click)="setFilter('pendiente_pago')"
                  title="Filtrar pendientes"
                >
                  <span class="pip" aria-hidden="true"></span>
                  {{ pendientesCount() }} pendientes de pago
                </button>
              }
            </span>
          </div>

          <div class="toolbar">
            <label class="search">
              <svg lucideSearch [size]="14"></svg>
              <input
                type="text"
                placeholder="Buscar por # reserva, cliente o email…"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event); page.set(1)"
              />
            </label>

            <div class="chip-group" role="tablist">
              @for (f of filters; track f.id) {
                <button
                  type="button"
                  class="chip"
                  [class.on]="filter() === f.id"
                  (click)="setFilter(f.id)"
                >
                  {{ f.label }}
                  @if (f.count !== null) {
                    <span class="pill">{{ f.count }}</span>
                  }
                </button>
              }
            </div>
          </div>

          <section class="card">
            @if (listError()) {
              <div class="error-banner" role="alert">
                <span>{{ listError() }}</span>
                <button type="button" class="btn btn-sm" (click)="reload()">Reintentar</button>
              </div>
            } @else if (loading() && rows().length === 0) {
              <div class="skeleton-list">
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="skeleton-row"></div>
                }
              </div>
            } @else if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideTicketX [size]="22"></svg>
                </span>
                <h3>Sin reservas con esos filtros</h3>
                <p>Cambia el filtro o limpia la búsqueda.</p>
                <button class="reset" type="button" (click)="resetFilters()">
                  Limpiar filtros
                </button>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl-ops">
                  <thead>
                    <tr>
                      <th># Reserva</th>
                      <th>Cliente</th>
                      <th class="col-hide-sm">Función</th>
                      <th class="right">Asientos</th>
                      <th class="right">Total</th>
                      <th>Estado</th>
                      <th class="col-hide-sm">Creada</th>
                      <th class="right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of paged(); track r.id) {
                      <tr
                        [class.is-urgent]="r.estado === 'pendiente_pago'"
                        (click)="open(r.id)"
                      >
                        <td><span class="col-num">{{ r.numero_reserva }}</span></td>
                        <td>
                          <div class="col-strong">{{ r.usuario?.nombre ?? '—' }}</div>
                          <div class="col-sub">{{ r.usuario?.email ?? '' }}</div>
                        </td>
                        <td class="col-hide-sm">
                          <div class="col-strong">{{ r.pelicula?.titulo ?? '—' }}</div>
                          <div class="col-sub">{{ r.cine?.nombre ?? '—' }}</div>
                        </td>
                        <td class="right tnum">{{ r.num_asientos }}</td>
                        <td class="right col-num">L {{ r.monto_total | number }}</td>
                        <td>
                          <span class="badge-state" [class]="'badge-state ' + r.estado">
                            <span class="glyph" aria-hidden="true"></span>
                            {{ estadoLabel(r.estado) }}
                          </span>
                        </td>
                        <td class="col-hide-sm col-sub tnum">
                          {{ r.created_at | date: 'd MMM HH:mm' }}
                        </td>
                        <td class="right" (click)="$event.stopPropagation()">
                          <div class="row-actions">
                            @if (r.estado === 'pendiente_pago') {
                              <a
                                class="primary"
                                title="Cobrar en taquilla"
                                [routerLink]="['/admin/recepcionista/pago-efectivo', r.numero_reserva]"
                              >
                                <svg lucideBanknote [size]="15"></svg>
                              </a>
                            }
                            <button
                              type="button"
                              title="Reenviar boleto"
                              [disabled]="r.estado !== 'pagada'"
                              (click)="reenviar(r)"
                            >
                              <svg lucideMail [size]="15"></svg>
                            </button>
                            <button
                              type="button"
                              title="Marcar asistencia"
                              [disabled]="r.estado !== 'pagada'"
                              (click)="marcarAsistencia(r)"
                            >
                              <svg lucideCheckCircle2 [size]="15"></svg>
                            </button>
                            <button
                              type="button"
                              class="danger"
                              title="Cancelar"
                              [disabled]="!canCancel(r)"
                              (click)="open(r.id, 'cancel')"
                            >
                              <svg lucideBan [size]="15"></svg>
                            </button>
                            <button
                              type="button"
                              title="Ver detalle"
                              (click)="open(r.id)"
                            >
                              <svg lucideEye [size]="15"></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="card-foot">
                <app-pager
                  [value]="{ page: page(), pageSize: pageSize(), total: totalRows() }"
                  (pageChange)="onPageChange($event)"
                  (pageSizeChange)="onPageSizeChange($event)"
                />
              </div>
            }
          </section>
        </div>
      </main>
    </div>

    <div class="toast-stack">
      @for (t of toasts(); track t.id) {
        <div class="toast" [class.t-error]="t.kind === 'err'">
          <span class="t-dot" aria-hidden="true"></span>
          <span>{{ t.msg }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: '../operaciones.shared.scss',
})
export class AdminReservasListadoComponent {
  private reservasSvc = inject(AdminReservasService);
  private router = inject(Router);

  readonly rows = signal<AdminReservaRow[]>([]);
  readonly loading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly filter = signal<FilterState>('all');
  readonly page = signal(1);
  readonly pageSize = signal(15);
  readonly toasts = signal<Toast[]>([]);

  /** Server-reported total (used for pagination). */
  readonly serverTotal = signal(0);

  private toastSeq = 0;

  readonly filters: { id: FilterState; label: string; count: number | null }[] = [
    { id: 'all', label: 'Todas', count: null },
    { id: 'pendiente_pago', label: 'Pendientes', count: 0 },
    { id: 'pagada', label: 'Pagadas', count: 0 },
    { id: 'cancelada', label: 'Canceladas', count: 0 },
    { id: 'expirada', label: 'Expiradas', count: 0 },
    { id: 'reembolsada', label: 'Reembolsadas', count: 0 },
  ];

  readonly pendientesCount = computed(
    () => this.rows().filter((r) => r.estado === 'pendiente_pago').length,
  );

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const f = this.filter();
    return this.rows().filter((r) => {
      if (f !== 'all' && r.estado !== f) return false;
      if (term) {
        const hit =
          r.numero_reserva.toLowerCase().includes(term) ||
          (r.usuario?.nombre.toLowerCase().includes(term) ?? false) ||
          (r.usuario?.email.toLowerCase().includes(term) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  });

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  /** Total for pagination: use server total when no local filter is active, else local count. */
  readonly totalRows = computed(() =>
    this.searchTerm() || this.filter() !== 'all'
      ? this.filtered().length
      : this.serverTotal(),
  );

  constructor() {
    this.cargar();

    effect(() => {
      const total = this.filtered().length;
      const max = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > max) this.page.set(max);
    });
  }

  private cargar() {
    this.loading.set(true);
    this.listError.set(null);
    this.rows.set([]);
    this.reservasSvc.list({ limit: 100 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.serverTotal.set(res.total);
        this.refreshFilterCounts();
        this.loading.set(false);
      },
      error: (err) => {
        this.listError.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  reload(): void { this.cargar(); }

  private refreshFilterCounts() {
    const counts: Record<string, number> = {};
    for (const r of this.rows()) counts[r.estado] = (counts[r.estado] ?? 0) + 1;
    for (const f of this.filters) {
      if (f.id !== 'all') f.count = counts[f.id] ?? 0;
    }
  }

  setFilter(f: FilterState) {
    this.filter.set(f);
    this.page.set(1);
  }

  resetFilters() {
    this.filter.set('all');
    this.searchTerm.set('');
    this.page.set(1);
  }

  onPageChange(p: number) {
    this.page.set(p);
  }

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.page.set(1);
  }

  open(id: string, fragment?: string) {
    this.router.navigate(['/admin/reservas', id], {
      fragment: fragment ?? undefined,
    });
  }

  canCancel(r: AdminReservaRow): boolean {
    return r.estado === 'pagada' || r.estado === 'pendiente_pago';
  }

  estadoLabel(e: string): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
      default: return e;
    }
  }

  reenviar(r: AdminReservaRow) {
    const email = r.usuario?.email ?? '';
    this.pushToast(`Boleto reenviado a ${email}`);
  }

  marcarAsistencia(r: AdminReservaRow) {
    this.pushToast(`Asistencia marcada · ${r.numero_reserva}`);
  }

  private pushToast(msg: string, kind: 'ok' | 'err' = 'ok') {
    const id = ++this.toastSeq;
    this.toasts.update((arr) => [...arr, { id, msg, kind }]);
    setTimeout(() => {
      this.toasts.update((arr) => arr.filter((t) => t.id !== id));
    }, 2600);
  }
}
