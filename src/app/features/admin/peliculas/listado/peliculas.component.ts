import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideFilm,
} from '@lucide/angular';

import {
  Pelicula,
  PeliculasService,
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
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
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
                {{ peliculas().length }} en catálogo · {{ activas() }} activas en cartelera
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
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
              />
            </label>

            <div class="filter-group" role="tablist" aria-label="Filtrar por estado">
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'todas'"
                (click)="setEstado('todas')"
                role="tab"
              >Todas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'activa'"
                (click)="setEstado('activa')"
                role="tab"
              >Activas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactiva'"
                (click)="setEstado('inactiva')"
                role="tab"
              >Inactivas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'proximos'"
                (click)="setEstado('proximos')"
                role="tab"
              >Próximos</button>
            </div>

            <select class="select-filter" [value]="idCiudad()" (change)="onCiudadChange($event)">
              <option value="">Todas las ciudades</option>
              @for (c of ciudades(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            <select class="select-filter" [value]="idCine()" (change)="onCineChange($event)">
              <option value="">{{ idCiudad() ? 'Todos los cines de la ciudad' : 'Todos los cines' }}</option>
              @for (c of cinesEnCiudad(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            <span class="result-count tnum">
              {{ filtered().length }} de {{ peliculas().length }}
            </span>
          </section>

          <section class="card">
            @if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideFilm [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                @if (searchTerm() || estadoFiltro() !== 'todas') {
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
                      <th class="col-gen">Géneros</th>
                      <th class="col-tnum">Duración</th>
                      <th class="col-tnum">Estreno</th>
                      <th class="col-tnum">Vendidos</th>
                      <th class="col-estado">Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of paged(); track p.id) {
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
                            @for (g of generosDePelicula(p); track g) {
                              <span class="gen-pill">{{ g }}</span>
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
  styleUrl: './peliculas.component.scss',
})
export class AdminPeliculasComponent {
  private peliculasSvc = inject(PeliculasService);
  private generosSvc = inject(GenerosService);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private funcionesSvc = inject(FuncionesService);
  private router = inject(Router);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly generos = signal<Genero[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly searchTerm = signal('');
  readonly estadoFiltro = signal<EstadoFiltro>('todas');
  readonly idCiudad = signal<string>('');
  readonly idCine = signal<string>('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly togglingId = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  readonly generosById = computed(() => {
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

  readonly activas = computed(
    () => this.peliculas().filter((p) => p.activo).length,
  );

  readonly cinesEnCiudad = computed(() => {
    const ciudadId = this.idCiudad();
    if (!ciudadId) return this.cines();
    return this.cines().filter((c) => c.id_ciudad === ciudadId);
  });

  readonly peliculasEnCine = computed(() => {
    const idCine = this.idCine();
    const idCiudad = this.idCiudad();
    if (!idCine && !idCiudad) return null;

    const cinesValidos = idCine
      ? new Set([idCine])
      : new Set(this.cinesEnCiudad().map((c) => c.id));

    const ids = new Set<string>();
    for (const f of this.funciones()) {
      if (cinesValidos.has(f.id_cine)) ids.add(f.id_pelicula);
    }
    return ids;
  });

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    const estado = this.estadoFiltro();
    const enCine = this.peliculasEnCine();
    return this.peliculas().filter((p) => {
      if (estado === 'proximos') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [y, m, d] = p.fecha_estreno.split('-').map(Number);
        const estreno = new Date(y!, (m ?? 1) - 1, d ?? 1);
        if (!(estreno > today)) return false;
      } else if (estado === 'activa' && !p.activo) {
        return false;
      } else if (estado === 'inactiva' && p.activo) {
        return false;
      }
      if (t && !p.titulo.toLowerCase().includes(t)) return false;
      if (enCine && !enCine.has(p.id)) return false;
      return true;
    });
  });

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  constructor() {
    this.refresh();
    this.generosSvc.list().subscribe((g) => this.generos.set(g));
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));
    this.funcionesSvc.list().subscribe((f) => this.funciones.set(f));

    const navState = this.router.getCurrentNavigation()?.extras?.state
      ?? history.state;
    if (navState?.toast) {
      this.showToast('ok', String(navState.toast));
    }

    effect(() => {
      const total = this.filtered().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  setEstado(e: EstadoFiltro) {
    this.estadoFiltro.set(e);
    this.page.set(1);
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

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  generosDePelicula(p: Pelicula): string[] {
    const map = this.generosById();
    return p.id_generos
      .map((id) => map.get(id))
      .filter((x): x is string => !!x);
  }

  idiomaNombre(id: string): string {
    return this.idiomas.get(id) ?? id;
  }

  onToggle(p: Pelicula) {
    if (this.togglingId()) return;
    this.togglingId.set(p.id);
    this.peliculasSvc.toggleActivo(p.id).subscribe({
      next: (updated) => {
        this.peliculas.update((arr) =>
          arr.map((x) => (x.id === updated.id ? updated : x)),
        );
        this.togglingId.set(null);
        const action = updated.activo ? 'activada' : 'desactivada';
        this.showToast('ok', `"${updated.titulo}" ${action}`);
      },
      error: (e) => {
        this.togglingId.set(null);
        this.showToast(
          'err',
          e?.message ?? `No se pudo actualizar "${p.titulo}"`,
        );
      },
    });
  }

  private refresh() {
    this.peliculasSvc.list().subscribe((data) => this.peliculas.set(data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
