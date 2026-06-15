import { Component, computed, inject, signal } from '@angular/core';
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
  EstadoPelicula,
} from '../../../../shared/services/peliculas.service';
import {
  Genero,
  GenerosService,
} from '../../../../shared/services/generos.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type EstadoFiltro = 'todas' | 'activa' | 'inactiva';

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
                (ngModelChange)="searchTerm.set($event)"
              />
            </label>

            <div class="filter-group" role="tablist" aria-label="Filtrar por estado">
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'todas'"
                (click)="estadoFiltro.set('todas')"
                role="tab"
                [attr.aria-selected]="estadoFiltro() === 'todas'"
              >Todas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'activa'"
                (click)="estadoFiltro.set('activa')"
                role="tab"
                [attr.aria-selected]="estadoFiltro() === 'activa'"
              >Activas</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactiva'"
                (click)="estadoFiltro.set('inactiva')"
                role="tab"
                [attr.aria-selected]="estadoFiltro() === 'inactiva'"
              >Inactivas</button>
            </div>

            <span class="result-count tnum">
              {{ filtered().length }} de {{ peliculas().length }}
            </span>
          </section>

          <section class="card">
            @if (filtered().length === 0) {
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
                    @for (p of filtered(); track p.id) {
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
                              {{ idiomaNombre(p.id_idioma) }} · {{ p.clasificacion }}
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
                              [class.on]="p.estado === 'activa'"
                              [disabled]="togglingId() === p.id"
                              (click)="onToggle(p)"
                              [attr.aria-label]="'Cambiar estado de ' + p.titulo"
                            >
                              <span class="toggle-thumb"></span>
                            </button>
                            <span class="estado-label" [class.on]="p.estado === 'activa'">
                              {{ p.estado === 'activa' ? 'Activa' : 'Inactiva' }}
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
  private router = inject(Router);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly generos = signal<Genero[]>([]);
  readonly searchTerm = signal('');
  readonly estadoFiltro = signal<EstadoFiltro>('todas');
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
    () => this.peliculas().filter((p) => p.estado === 'activa').length,
  );

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    const estado = this.estadoFiltro();
    return this.peliculas().filter((p) => {
      if (estado !== 'todas' && p.estado !== estado) return false;
      if (t && !p.titulo.toLowerCase().includes(t)) return false;
      return true;
    });
  });

  constructor() {
    this.refresh();
    this.generosSvc.list().subscribe((g) => this.generos.set(g));

    const navState = this.router.getCurrentNavigation()?.extras?.state
      ?? history.state;
    if (navState?.toast) {
      this.showToast('ok', String(navState.toast));
    }
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
    const prevEstado: EstadoPelicula = p.estado;
    this.togglingId.set(p.id);
    this.peliculasSvc.toggleEstado(p.id).subscribe({
      next: (updated) => {
        this.peliculas.update((arr) =>
          arr.map((x) => (x.id === updated.id ? updated : x)),
        );
        this.togglingId.set(null);
        const action = updated.estado === 'activa' ? 'activada' : 'desactivada';
        this.showToast('ok', `"${updated.titulo}" ${action}`);
      },
      error: (e) => {
        this.togglingId.set(null);
        this.showToast(
          'err',
          e?.message ?? `No se pudo actualizar "${p.titulo}"`,
        );
        // restore visually (no-op, signal still has prevEstado)
        prevEstado;
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
