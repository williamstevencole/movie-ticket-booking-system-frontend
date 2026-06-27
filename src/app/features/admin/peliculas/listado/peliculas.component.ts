import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideFilm,
  LucideRefreshCw,
} from '@lucide/angular';

import {
  Pelicula,
  PeliculasService,
  ListPeliculasQuery,
} from '../../../../shared/services/peliculas.service';
import {
  Genero,
  GenerosService,
} from '../../../../shared/services/generos.service';
import {
  Cine,
  CinesService,
} from '../../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import { extractMessage } from '../../../../shared/utils/http-errors';
import { ToastService } from '../../../../shared/services/toast.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

type EstadoFiltro = 'todas' | 'activa' | 'inactiva' | 'proximos';

@Component({
  selector: 'app-admin-peliculas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideFilm,
    LucideRefreshCw,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Películas</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Películas</h1>
              <p class="lead">
                @if (loading() && total() === 0) {
                  Cargando…
                } @else {
                  {{ total() }} en catálogo
                }
              </p>
            </div>
            <a routerLink="/admin/peliculas/crear" class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nueva película</span>
            </a>
          </div>

          <section class="toolbar">
            <label class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                class="search-input"
                type="text"
                placeholder="Buscar por título…"
                (input)="onBusqueda($event)"
              />
            </label>

            <div class="filter-group" role="tablist" aria-label="Filtrar por estado">
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'todas'"
                (click)="setEstadoFiltro('todas')"
                role="tab"
              >Todas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'activa'"
                (click)="setEstadoFiltro('activa')"
                role="tab"
              >Activas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactiva'"
                (click)="setEstadoFiltro('inactiva')"
                role="tab"
              >Inactivas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'proximos'"
                (click)="setEstadoFiltro('proximos')"
                role="tab"
              >Próximos</button>
            </div>

            <select class="select-filter" [value]="idCiudad()" (change)="onCiudadChange($event)">
              <option value="">Todas las ciudades</option>
              @for (c of ciudades(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            <!-- TODO: backend has no cine_id filter yet; re-enable when added -->
            <!-- <select class="select-filter" [value]="idCine()" (change)="onCineChange($event)">
              <option value="">{{ idCiudad() ? 'Todos los cines de la ciudad' : 'Todos los cines' }}</option>
              @for (c of cinesEnCiudad(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select> -->
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
            @if (loading() && peliculas().length === 0) {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th class="col-poster" aria-label="Poster"></th>
                      <th class="col-titulo">Título</th>
                      <th class="col-gen">Género</th>
                      <th class="col-tnum">Duración</th>
                      <th class="col-tnum">Estreno</th>
                      <th class="col-tnum">Vendidos</th>
                      <th class="col-estado">Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (_ of skeletonRows; track $index) {
                      <tr class="row-skeleton">
                        <td colspan="8"><span class="skeleton-bar"></span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (peliculas().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideFilm [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                @if (busqueda() || estadoFiltro() !== 'todas') {
                  <p>Cambia los filtros o el término de búsqueda.</p>
                } @else {
                  <p>Aún no hay películas en el catálogo.</p>
                  <a routerLink="/admin/peliculas/crear" class="btn btn-primary btn-sm">
                    <svg lucidePlus [size]="14"></svg>
                    <span>Agregar la primera</span>
                  </a>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th class="col-poster" aria-label="Poster"></th>
                      <th class="col-titulo">Título</th>
                      <th class="col-gen">Género</th>
                      <th class="col-tnum">Duración</th>
                      <th class="col-tnum">Estreno</th>
                      <th class="col-tnum">Vendidos</th>
                      <th class="col-estado">Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of peliculas(); track p.id) {
                      <tr>
                        <td class="col-poster">
                          <div class="poster">
                            @if (p.poster_url) {
                              <img [src]="p.poster_url" [alt]="p.titulo" />
                            } @else {
                              <span>{{ p.titulo.charAt(0) }}</span>
                            }
                          </div>
                        </td>
                        <td class="col-titulo">
                          <div class="titulo-cell">
                            <span class="titulo">{{ p.titulo }}</span>
                            <span class="meta">
                              {{ idiomaNombre(p.id_idioma) }}
                            </span>
                          </div>
                        </td>
                        <td class="col-gen">
                          <div class="gen-list">
                            @if (generoNombre(p.id_genero); as nombre) {
                              <span class="gen-pill">{{ nombre }}</span>
                            } @else {
                              <span class="text-muted">—</span>
                            }
                          </div>
                        </td>
                        <td class="col-tnum tnum">{{ p.duracion_min }} min</td>
                        <td class="col-tnum tnum">{{ p.fecha_estreno | date: 'd MMM y' }}</td>
                        <td class="col-tnum tnum">{{ p.boletos_vendidos | number }}</td>
                        <td class="col-estado">
                          <div class="estado-toggle">
                            <button
                              class="toggle"
                              [class.on]="p.activo"
                              [disabled]="togglingId() === p.id"
                              (click)="onToggle(p)"
                              [attr.aria-label]="'Cambiar estado de ' + p.titulo"
                            >
                              <span class="toggle-thumb"></span>
                            </button>
                            <span class="estado-label" [class.on]="p.activo">
                              {{ p.activo ? 'Activa' : 'Inactiva' }}
                            </span>
                          </div>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <a
                              class="icon-btn"
                              [routerLink]="['/admin/peliculas', p.id, 'editar']"
                              title="Editar"
                              aria-label="Editar película"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </a>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <app-pager
                [value]="{ page: page(), pageSize: pageSize(), total: total() }"
                (pageChange)="page.set($event)"
                (pageSizeChange)="onPageSizeChange($event)"
              />
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrl: './peliculas.component.scss',
})
export class AdminPeliculasComponent {
  private peliculasSvc = inject(PeliculasService);
  private generosSvc = inject(GenerosService);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private funcionesSvc = inject(FuncionesService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly generos = signal<Genero[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly total = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly busqueda = signal('');
  readonly estadoFiltro = signal<EstadoFiltro>('todas');
  readonly idCiudad = signal<string>('');
  readonly idCine = signal<string>('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly togglingId = signal<string | null>(null);
  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  private busquedaDebounce: ReturnType<typeof setTimeout> | null = null;

  private readonly generosById = computed(() => {
    const map = new Map<string, string>();
    for (const g of this.generos()) map.set(g.id, g.nombre);
    return map;
  });

  readonly idiomas = new Map<string, string>([
    ['i-1', 'Español'],
    ['i-2', 'Español (sub)'],
    ['i-3', 'Inglés'],
    ['i-4', 'Inglés (sub)'],
    ['i-5', 'Japonés (sub)'],
    ['i-6', 'Francés (sub)'],
  ]);

  readonly cinesEnCiudad = computed(() => {
    const ciudadId = this.idCiudad();
    if (!ciudadId) return this.cines();
    return this.cines().filter((c) => c.id_ciudad === ciudadId);
  });

  constructor() {
    this.generosSvc.list().subscribe((g) => this.generos.set(g));
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));
    this.funcionesSvc.list().subscribe((f) => this.funciones.set(f));

    const navState = this.router.getCurrentNavigation()?.extras?.state
      ?? history.state;
    if (navState?.toast) {
      this.toast.show(String(navState.toast));
    }

    effect(() => {
      const query: ListPeliculasQuery = {
        page: this.page(),
        limit: this.pageSize(),
        titulo: this.busqueda(),
        ciudad_id: this.idCiudad() || undefined,
      };
      this.fetch(query);
    });
  }

  private fetch(query: ListPeliculasQuery): void {
    this.loading.set(true);
    this.error.set(null);
    this.peliculasSvc.list(query).subscribe({
      next: (res) => {
        const filtered = this.applyEstadoFilter(res.data);
        this.peliculas.set(filtered);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.peliculas.set([]);
        this.total.set(0);
        this.error.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.fetch({
      page: this.page(),
      limit: this.pageSize(),
      titulo: this.busqueda(),
    });
  }

  private applyEstadoFilter(rows: Pelicula[]): Pelicula[] {
    const f = this.estadoFiltro();
    if (f === 'todas') return rows;
    if (f === 'activa') return rows.filter((p) => p.activo);
    if (f === 'inactiva') return rows.filter((p) => !p.activo);
    // 'proximos' = fecha_estreno >= hoy
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((p) => p.fecha_estreno >= today);
  }

  generoNombre(id: string | null): string | null {
    if (!id) return null;
    return this.generosById().get(id) ?? null;
  }

  idiomaNombre(id: string): string {
    return this.idiomas.get(id) ?? id;
  }

  setEstadoFiltro(f: EstadoFiltro): void {
    this.estadoFiltro.set(f);
    this.page.set(1);
    this.reload();
  }

  onCiudadChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value;
    this.idCiudad.set(val);
    this.idCine.set('');
    this.page.set(1);
  }

  onCineChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value;
    this.idCine.set(val);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  onBusqueda(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (this.busquedaDebounce) clearTimeout(this.busquedaDebounce);
    this.busquedaDebounce = setTimeout(() => {
      this.busqueda.set(value);
      this.page.set(1);
    }, 250);
  }

  onToggle(p: Pelicula) {
    if (this.togglingId()) return;
    this.togglingId.set(p.id);
    this.peliculasSvc.toggleActivo(p.id, !p.activo).subscribe({
      next: (updated) => {
        this.peliculas.update((arr) =>
          arr.map((x) => (x.id === updated.id ? updated : x)),
        );
        this.togglingId.set(null);
        const action = updated.activo ? 'activada' : 'desactivada';
        this.toast.show(`"${updated.titulo}" ${action}`);
      },
      error: (err) => {
        this.togglingId.set(null);
        this.toast.show(
          `No se pudo actualizar "${p.titulo}": ${extractMessage(err)}`,
        );
      },
    });
  }
}
