import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucidePencil,
  LucideArmchair,
  LucideGrid3x3,
  LucideSearch,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import { ToastService } from '../../../../shared/services/toast.service';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

type SalaRow = {
  key: string;
  id: string;
  nombre: string;
  cineId: string;
  cineNombre: string;
  filas: number;
  columnas: number;
  asientos: number;
};

@Component({
  selector: 'app-admin-salas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    PagerComponent,
    LucidePlus,
    LucidePencil,
    LucideArmchair,
    LucideGrid3x3,
    LucideSearch,
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
            <span class="crumb-current">Salas</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Salas</h1>
              <p class="lead">
                {{ totalActivos() }} activas · {{ rows().length }} en total
              </p>
            </div>
            <a routerLink="/admin/salas/crear" class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nueva sala</span>
            </a>
          </div>

          <section class="toolbar">
            <div class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                type="search"
                placeholder="Buscar sala o cine…"
                [value]="busqueda()"
                (input)="onBusqueda($event)"
              />
            </div>

            <div class="filter-group" role="tablist">
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'todos'"
                (click)="setEstadoFiltro('todos')"
              >Todas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'activos'"
                (click)="setEstadoFiltro('activos')"
              >Activas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactivos'"
                (click)="setEstadoFiltro('inactivos')"
              >Inactivas</button>
            </div>

            <select
              class="select-filter"
              [value]="idCine()"
              (change)="onCineChange($event)"
            >
              <option value="">Todos los cines</option>
              @for (c of cines(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            <span class="result-count tnum">
              {{ filtered().length }} de {{ rows().length }}
            </span>
          </section>

          <section class="card">
            @if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideArmchair [size]="22"></svg>
                </span>
                <h3>Sin salas</h3>
                @if (busqueda() || idCine() || estadoFiltro() !== 'todos') {
                  <p>No hay salas que coincidan con los filtros.</p>
                } @else {
                  <p>Aún no hay salas registradas.</p>
                  <a routerLink="/admin/salas/crear" class="btn btn-primary btn-sm">
                    <svg lucidePlus [size]="14"></svg>
                    <span>Crear la primera</span>
                  </a>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Sala</th>
                      <th>Cine</th>
                      <th class="col-num">Grilla</th>
                      <th class="col-num">Asientos</th>
                      <th class="col-num">Funciones</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of paged(); track s.key) {
                      <tr [class.is-inactive]="!isActivo(s.key)">
                        <td>
                          <div class="sala-cell">
                            <span class="sala-mark">
                              <svg lucideArmchair [size]="16"></svg>
                            </span>
                            <span class="sala-nombre">{{ s.nombre }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="cine-name">{{ s.cineNombre }}</span>
                        </td>
                        <td class="col-num">
                          <span class="grilla tnum">{{ s.filas }} × {{ s.columnas }}</span>
                        </td>
                        <td class="col-num">
                          <span class="tnum asientos">{{ s.asientos }}</span>
                        </td>
                        <td class="col-num">
                          <span class="tnum func-count">{{ funcionesActivas(s) }}</span>
                        </td>
                        <td>
                          <span
                            class="estado-badge"
                            [class.activo]="isActivo(s.key)"
                            [class.inactivo]="!isActivo(s.key)"
                          >
                            {{ isActivo(s.key) ? 'Activa' : 'Inactiva' }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <span
                              class="icon-btn is-disabled"
                              title="Editar sala (próximamente)"
                              aria-disabled="true"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </span>
                            <span
                              class="icon-btn is-disabled"
                              title="Ver distribución (próximamente)"
                              aria-disabled="true"
                            >
                              <svg lucideGrid3x3 [size]="15"></svg>
                            </span>
                            <button
                              class="icon-btn"
                              [class.danger]="isActivo(s.key)"
                              (click)="toggleEstado(s)"
                              [title]="isActivo(s.key) ? 'Desactivar' : 'Activar'"
                            >
                              @if (isActivo(s.key)) {
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
  styleUrl: './salas.component.scss',
})
export class AdminSalasComponent {
  private cinesSvc = inject(CinesService);
  private funcionesSvc = inject(FuncionesService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  readonly cines = signal<Cine[]>([]);
  readonly funciones = signal<Funcion[]>([]);

  readonly busqueda = signal<string>('');
  readonly idCine = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');
  readonly inactivos = signal<Set<string>>(new Set());

  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly rows = computed<SalaRow[]>(() => {
    const out: SalaRow[] = [];
    for (const c of this.cines()) {
      for (const s of c.salas) {
        out.push({
          key: `${c.id}:${s.id}`,
          id: s.id,
          nombre: s.nombre,
          cineId: c.id,
          cineNombre: c.nombre,
          filas: s.filas,
          columnas: s.columnas,
          asientos: s.filas * s.columnas,
        });
      }
    }
    return out;
  });

  readonly funcionesActivasPorSala = computed(() => {
    const map = new Map<string, number>();
    for (const f of this.funciones()) {
      if (f.estado === 'programada' || f.estado === 'en_curso') {
        const key = `${f.id_cine}:${f.id_sala}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  });

  readonly totalActivos = computed(
    () => this.rows().filter((s) => !this.inactivos().has(s.key)).length,
  );

  readonly filtered = computed(() => {
    const needle = this.busqueda().trim().toLowerCase();
    const cine = this.idCine();
    const estado = this.estadoFiltro();
    const inactivos = this.inactivos();
    return this.rows().filter((s) => {
      if (cine && s.cineId !== cine) return false;
      if (estado === 'activos' && inactivos.has(s.key)) return false;
      if (estado === 'inactivos' && !inactivos.has(s.key)) return false;
      if (needle) {
        const haystack = `${s.nombre} ${s.cineNombre}`.toLowerCase();
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
    this.funcionesSvc.list().subscribe((f) => this.funciones.set(f));

    const preCine = this.route.snapshot.queryParamMap.get('cine');
    if (preCine) this.idCine.set(preCine);

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

  onCineChange(e: Event) {
    this.idCine.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  isActivo(key: string): boolean {
    return !this.inactivos().has(key);
  }

  funcionesActivas(s: SalaRow): number {
    return this.funcionesActivasPorSala().get(s.key) ?? 0;
  }

  toggleEstado(s: SalaRow) {
    const activo = this.isActivo(s.key);
    if (activo && this.funcionesActivas(s) > 0) {
      this.toast.show(
        `${s.nombre} tiene funciones futuras programadas y no se puede desactivar`,
      );
      return;
    }
    const next = new Set(this.inactivos());
    if (next.has(s.key)) {
      next.delete(s.key);
      this.toast.show(`${s.nombre} activada`);
    } else {
      next.add(s.key);
      this.toast.show(`${s.nombre} desactivada`);
    }
    this.inactivos.set(next);
  }
}
