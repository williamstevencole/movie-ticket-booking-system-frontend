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
  EstadoReserva,
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../../../shared/services/reservas.service';
import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../../shared/services/peliculas.service';
import {
  Cine,
  CinesService,
} from '../../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

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
              <span>{{ rows().length }} reservas</span>
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
            @if (paged().length === 0) {
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
                          <div class="col-strong">{{ usuarioNombre(r.id_usuario) }}</div>
                          <div class="col-sub">{{ usuarioEmail(r.id_usuario) }}</div>
                        </td>
                        <td class="col-hide-sm">
                          <div class="col-strong">{{ peliculaTitulo(r.id_funcion) }}</div>
                          <div class="col-sub">{{ cineSala(r.id_funcion) }}</div>
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
                  [value]="{ page: page(), pageSize: pageSize(), total: filtered().length }"
                  (pageChange)="page.set($event)"
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
  private reservasSvc = inject(ReservasService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private router = inject(Router);

  readonly rows = signal<Reserva[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly usuarios = signal<ReservaUsuario[]>([]);

  readonly searchTerm = signal('');
  readonly filter = signal<FilterState>('all');
  readonly page = signal(1);
  readonly pageSize = signal(15);
  readonly toasts = signal<Toast[]>([]);

  private toastSeq = 0;

  readonly filters: { id: FilterState; label: string; count: number | null }[] = [
    { id: 'all', label: 'Todas', count: null },
    { id: 'pendiente_pago', label: 'Pendientes', count: 0 },
    { id: 'pagada', label: 'Pagadas', count: 0 },
    { id: 'cancelada', label: 'Canceladas', count: 0 },
    { id: 'expirada', label: 'Expiradas', count: 0 },
    { id: 'reembolsada', label: 'Reembolsadas', count: 0 },
  ];

  readonly funcionesById = computed(() => {
    const m = new Map<string, Funcion>();
    for (const f of this.funciones()) m.set(f.id, f);
    return m;
  });
  readonly peliculasById = computed(() => {
    const m = new Map<string, Pelicula>();
    for (const p of this.peliculas()) m.set(p.id, p);
    return m;
  });
  readonly cinesById = computed(() => {
    const m = new Map<string, Cine>();
    for (const c of this.cines()) m.set(c.id, c);
    return m;
  });
  readonly usuariosById = computed(() => {
    const m = new Map<string, ReservaUsuario>();
    for (const u of this.usuarios()) m.set(u.id, u);
    return m;
  });

  readonly pendientesCount = computed(
    () => this.rows().filter((r) => r.estado === 'pendiente_pago').length,
  );

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const f = this.filter();
    return this.rows().filter((r) => {
      if (f !== 'all' && r.estado !== f) return false;
      if (term) {
        const u = this.usuariosById().get(r.id_usuario);
        const hit =
          r.numero_reserva.toLowerCase().includes(term) ||
          (u?.nombre.toLowerCase().includes(term) ?? false) ||
          (u?.email.toLowerCase().includes(term) ?? false);
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

  constructor() {
    this.reservasSvc.listAll().subscribe((d) => {
      this.rows.set(d);
      this.refreshFilterCounts();
    });
    this.reservasSvc.listUsuarios().subscribe((d) => this.usuarios.set(d));
    this.funcionesSvc.list().subscribe((d) => this.funciones.set(d));
    this.peliculasSvc.list().subscribe((d) => this.peliculas.set(d.data));
    this.cinesSvc.list().subscribe((d) => this.cines.set(d.data));

    effect(() => {
      const total = this.filtered().length;
      const max = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > max) this.page.set(max);
    });
  }

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

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.page.set(1);
  }

  open(id: string, fragment?: string) {
    this.router.navigate(['/admin/reservas', id], {
      fragment: fragment ?? undefined,
    });
  }

  canCancel(r: Reserva): boolean {
    return r.estado === 'pagada' || r.estado === 'pendiente_pago';
  }

  estadoLabel(e: Reserva['estado']): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
    }
  }

  usuarioNombre(id: string): string {
    return this.usuariosById().get(id)?.nombre ?? '—';
  }
  usuarioEmail(id: string): string {
    return this.usuariosById().get(id)?.email ?? '';
  }
  peliculaTitulo(idFuncion: string): string {
    const f = this.funcionesById().get(idFuncion);
    return f ? this.peliculasById().get(f.id_pelicula)?.titulo ?? '—' : '—';
  }
  cineSala(idFuncion: string): string {
    const f = this.funcionesById().get(idFuncion);
    if (!f) return '—';
    const cine = this.cinesById().get(f.id_cine);
    if (!cine) return '—';
    const sala = cine.salas.find((s) => s.id === f.id_sala);
    return sala ? `${cine.nombre} · Sala ${sala.nombre}` : cine.nombre;
  }

  reenviar(r: Reserva) {
    const email = this.usuarioEmail(r.id_usuario);
    this.pushToast(`Boleto reenviado a ${email}`);
  }

  marcarAsistencia(r: Reserva) {
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
