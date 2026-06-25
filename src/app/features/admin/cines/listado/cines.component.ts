import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucidePencil,
  LucideArmchair,
  LucideBuilding2,
  LucideSearch,
  LucideChevronRight,
  LucideRefreshCw,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';

import {
  Cine,
  CinesService,
  CinesPage,
  ListCinesQuery,
} from '../../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { extractMessage } from '../../../../shared/utils/http-errors';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-admin-cines',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    PagerComponent,
    LucidePlus,
    LucidePencil,
    LucideArmchair,
    LucideBuilding2,
    LucideSearch,
    LucideChevronRight,
    LucideRefreshCw,
    LucidePower,
    LucidePowerOff,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Cines</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Cines</h1>
              <p class="lead">
                {{ totalActivos() }} activos · {{ totalCines() }} en total
              </p>
            </div>
            <a routerLink="/admin/cines/crear" class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nuevo cine</span>
            </a>
          </div>

          <section class="toolbar">
            <div class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                type="search"
                placeholder="Buscar cine…"
                [value]="busqueda()"
                (input)="onBusqueda($event)"
              />
            </div>

            <div class="filter-group" role="tablist">
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'todos'"
                (click)="setEstadoFiltro('todos')"
              >Todos</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'activos'"
                (click)="setEstadoFiltro('activos')"
              >Activos</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactivos'"
                (click)="setEstadoFiltro('inactivos')"
              >Inactivos</button>
            </div>

            <select
              class="select-filter"
              [value]="idCiudad()"
              (change)="onCiudadChange($event)"
            >
              <option value="">Todas las ciudades</option>
              @for (c of ciudades(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            <span class="result-count tnum">
              {{ filtered().length }} de {{ cines().length }}
            </span>
          </section>

          @if (error(); as msg) {
            <section class="error-banner" role="alert">
              <span>{{ msg }}</span>
              <button class="btn btn-ghost" (click)="reload()">
                <svg lucideRefreshCw [size]="14"></svg>
                Reintentar
              </button>
            </section>
          }

          <section class="card">
            @if (loading() && cines().length === 0) {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Cine</th>
                      <th class="col-ciudad">Ciudad</th>
                      <th class="col-dir">Dirección</th>
                      <th class="col-num">Salas</th>
                      <th class="col-num">Funciones</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (_ of skeletonRows; track $index) {
                      <tr class="row-skeleton">
                        <td colspan="7"><span class="skeleton-bar"></span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideBuilding2 [size]="22"></svg>
                </span>
                <h3>Sin cines</h3>
                @if (busqueda() || idCiudad() || estadoFiltro() !== 'todos') {
                  <p>No hay cines que coincidan con los filtros.</p>
                } @else {
                  <p>Aún no hay cines registrados.</p>
                  <a routerLink="/admin/cines/crear" class="btn btn-primary btn-sm">
                    <svg lucidePlus [size]="14"></svg>
                    <span>Crear el primero</span>
                  </a>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Cine</th>
                      <th class="col-ciudad">Ciudad</th>
                      <th class="col-dir">Dirección</th>
                      <th class="col-num">Salas</th>
                      <th class="col-num">Funciones</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of paged(); track c.id) {
                      <tr [class.is-inactive]="!c.activo">
                        <td>
                          <div class="cine-cell">
                            <span class="cine-mark">
                              <svg lucideBuilding2 [size]="16"></svg>
                            </span>
                            <span class="cine-nombre">{{ c.nombre }}</span>
                          </div>
                        </td>
                        <td class="col-ciudad">
                          <span class="ciudad-name">{{ ciudadNombre(c.id_ciudad) }}</span>
                        </td>
                        <td class="col-dir">
                          <span class="dir">{{ c.direccion || '—' }}</span>
                        </td>
                        <td class="col-num">
                          <button
                            class="link-count"
                            (click)="verSalas(c)"
                            title="Ver salas de este cine"
                          >
                            <span class="tnum">{{ c.salas.length }}</span>
                            <svg lucideChevronRight [size]="13"></svg>
                          </button>
                        </td>
                        <td class="col-num">
                          <span class="tnum func-count">{{ funcionesActivas(c.id) }}</span>
                        </td>
                        <td>
                          <span
                            class="estado-badge"
                            [class.activo]="c.activo"
                            [class.inactivo]="!c.activo"
                          >
                            {{ c.activo ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <a
                              class="icon-btn"
                              [routerLink]="['/admin/cines', c.id, 'editar']"
                              title="Editar"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </a>
                            <button
                              class="icon-btn"
                              (click)="verSalas(c)"
                              title="Ver salas"
                            >
                              <svg lucideArmchair [size]="16"></svg>
                            </button>
                            <button
                              class="icon-btn"
                              [class.danger]="c.activo"
                              [disabled]="togglingId() === c.id"
                              (click)="toggleEstado(c)"
                              [title]="c.activo ? 'Desactivar' : 'Activar'"
                            >
                              @if (c.activo) {
                                <svg lucidePower [size]="15"></svg>
                              } @else {
                                <svg lucidePowerOff [size]="15"></svg>
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <app-pager
                [value]="{ page: page(), pageSize: pageSize(), total: filtered().length }"
                (pageChange)="page.set($event)"
                (pageSizeChange)="onPageSizeChange($event)"
              />
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrl: './cines.component.scss',
})
export class AdminCinesComponent {
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private funcionesSvc = inject(FuncionesService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly funciones = signal<Funcion[]>([]);

  readonly busqueda = signal<string>('');
  readonly idCiudad = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');

  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly total = signal<number>(0);
  readonly togglingId = signal<string | null>(null);
  readonly skeletonRows = Array.from({ length: 6 });

  readonly ciudadesById = computed(() => {
    const map = new Map<string, Ciudad>();
    for (const c of this.ciudades()) map.set(c.id, c);
    return map;
  });

  readonly funcionesActivasPorCine = computed(() => {
    const map = new Map<string, number>();
    for (const f of this.funciones()) {
      if (f.estado === 'programada' || f.estado === 'en_curso') {
        map.set(f.id_cine, (map.get(f.id_cine) ?? 0) + 1);
      }
    }
    return map;
  });

  readonly totalCines = computed(() => this.cines().length);
  readonly totalActivos = computed(
    () => this.cines().filter((c) => c.activo).length,
  );

  readonly filtered = computed(() => {
    const needle = this.busqueda().trim().toLowerCase();
    const ciudad = this.idCiudad();
    const estado = this.estadoFiltro();
    return this.cines().filter((c) => {
      if (ciudad && c.id_ciudad !== ciudad) return false;
      if (estado === 'activos' && !c.activo) return false;
      if (estado === 'inactivos' && c.activo) return false;
      if (needle) {
        const haystack = `${c.nombre} ${c.direccion ?? ''} ${this.ciudadNombre(c.id_ciudad)}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
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
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));
    this.funcionesSvc.list().subscribe((f) => this.funciones.set(f));
    this.fetch();

    effect(() => {
      const total = this.filtered().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  private fetch(): void {
    const q: ListCinesQuery = {
      page: 1,
      limit: 100,
      name: this.busqueda() || undefined,
      id_ciudad: this.idCiudad() || undefined,
    };
    this.loading.set(true);
    this.error.set(null);
    this.cinesSvc.list(q).subscribe({
      next: (res: CinesPage) => {
        this.cines.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.cines.set([]);
        this.total.set(0);
        this.error.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.fetch();
  }

  onBusqueda(e: Event) {
    this.busqueda.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onCiudadChange(e: Event) {
    this.idCiudad.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  setEstadoFiltro(f: EstadoFiltro) {
    this.estadoFiltro.set(f);
    this.page.set(1);
  }

  toggleEstado(c: Cine) {
    if (this.togglingId() === c.id) return;
    const next = !c.activo;
    this.togglingId.set(c.id);
    this.cinesSvc.setActivo(c.id, next).subscribe({
      next: (updated) => {
        this.cines.update((list) =>
          list.map((x) => (x.id === c.id ? { ...x, activo: updated.activo } : x)),
        );
        this.togglingId.set(null);
        this.toast.show(`${c.nombre} ${next ? 'activado' : 'desactivado'}`);
      },
      error: (err) => {
        this.togglingId.set(null);
        this.toast.show(`Error: ${extractMessage(err)}`);
      },
    });
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  ciudadNombre(id: string): string {
    return this.ciudadesById().get(id)?.nombre ?? '—';
  }

  funcionesActivas(id: string): number {
    return this.funcionesActivasPorCine().get(id) ?? 0;
  }

  verSalas(c: Cine) {
    this.router.navigate(['/admin/salas'], { queryParams: { cine: c.id } });
  }
}
