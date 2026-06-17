import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucidePencil,
  LucideArmchair,
  LucideBuilding2,
  LucideSearch,
  LucidePower,
  LucidePowerOff,
  LucideChevronRight,
} from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
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

type Toast = { kind: 'ok' | 'err'; text: string } | null;
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
    LucidePower,
    LucidePowerOff,
    LucideChevronRight,
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
                {{ totalActivos() }} activos · {{ cines().length }} en total
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

          <section class="card">
            @if (paged().length === 0) {
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
                      <tr [class.is-inactive]="!isActivo(c.id)">
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
                            [class.activo]="isActivo(c.id)"
                            [class.inactivo]="!isActivo(c.id)"
                          >
                            {{ isActivo(c.id) ? 'Activo' : 'Inactivo' }}
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
                              [class.danger]="isActivo(c.id)"
                              (click)="toggleEstado(c)"
                              [title]="isActivo(c.id) ? 'Desactivar' : 'Activar'"
                            >
                              @if (isActivo(c.id)) {
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

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './cines.component.scss',
})
export class AdminCinesComponent {
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private funcionesSvc = inject(FuncionesService);
  private router = inject(Router);

  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly funciones = signal<Funcion[]>([]);

  readonly busqueda = signal<string>('');
  readonly idCiudad = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');
  readonly inactivos = signal<Set<string>>(new Set());

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly toast = signal<Toast>(null);

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

  readonly totalActivos = computed(
    () => this.cines().filter((c) => !this.inactivos().has(c.id)).length,
  );

  readonly filtered = computed(() => {
    const needle = this.busqueda().trim().toLowerCase();
    const ciudad = this.idCiudad();
    const estado = this.estadoFiltro();
    const inactivos = this.inactivos();
    return this.cines().filter((c) => {
      if (ciudad && c.id_ciudad !== ciudad) return false;
      if (estado === 'activos' && inactivos.has(c.id)) return false;
      if (estado === 'inactivos' && !inactivos.has(c.id)) return false;
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
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));
    this.funcionesSvc.list().subscribe((f) => this.funciones.set(f));

    effect(() => {
      const total = this.filtered().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  onBusqueda(e: Event) {
    this.busqueda.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  setEstadoFiltro(f: EstadoFiltro) {
    this.estadoFiltro.set(f);
    this.page.set(1);
  }

  onCiudadChange(e: Event) {
    this.idCiudad.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  isActivo(id: string): boolean {
    return !this.inactivos().has(id);
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

  toggleEstado(c: Cine) {
    const next = new Set(this.inactivos());
    if (next.has(c.id)) {
      next.delete(c.id);
      this.showToast('ok', `${c.nombre} activado`);
    } else {
      next.add(c.id);
      this.showToast('ok', `${c.nombre} desactivado`);
    }
    this.inactivos.set(next);
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
