import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucidePencil,
  LucideX,
  LucideClapperboard,
} from '@lucide/angular';

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
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type Filtro = 'todas' | 'hoy' | 'proximas' | 'pasadas';

@Component({
  selector: 'app-admin-funciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    AdminSidebarComponent,
    PagerComponent,
    LucidePlus,
    LucidePencil,
    LucideX,
    LucideClapperboard,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Funciones</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Funciones</h1>
              <p class="lead">
                {{ totalProgramadas() }} programadas · {{ funcionesHoy() }} hoy
              </p>
            </div>
            <a routerLink="/admin/funciones/crear" class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nueva función</span>
            </a>
          </div>

          <section class="toolbar">
            <div class="filter-group" role="tablist">
              <button
                class="filter-chip"
                [class.on]="filtro() === 'todas'"
                (click)="setFiltro('todas')"
              >Todas</button>
              <button
                class="filter-chip"
                [class.on]="filtro() === 'hoy'"
                (click)="setFiltro('hoy')"
              >Hoy</button>
              <button
                class="filter-chip"
                [class.on]="filtro() === 'proximas'"
                (click)="setFiltro('proximas')"
              >Próximas</button>
              <button
                class="filter-chip"
                [class.on]="filtro() === 'pasadas'"
                (click)="setFiltro('pasadas')"
              >Pasadas</button>
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
              {{ filtered().length }} de {{ funciones().length }}
            </span>
          </section>

          <section class="card">
            @if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideClapperboard [size]="22"></svg>
                </span>
                <h3>Sin funciones</h3>
                @if (filtro() === 'todas') {
                  <p>Aún no hay funciones programadas.</p>
                  <a routerLink="/admin/funciones/crear" class="btn btn-primary btn-sm">
                    <svg lucidePlus [size]="14"></svg>
                    <span>Programar la primera</span>
                  </a>
                } @else {
                  <p>No hay funciones en este filtro.</p>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Película</th>
                      <th class="col-sala">Cine · sala</th>
                      <th class="col-ocupacion">Ocupación</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (f of paged(); track f.id) {
                      <tr>
                        <td>
                          <div class="when">
                            <span class="when-time tnum">
                              {{ f.fecha_hora | date: 'HH:mm' }}
                            </span>
                            <span class="when-day">{{ dayLabel(f.fecha_hora) }}</span>
                          </div>
                        </td>
                        <td>
                          <div class="pelicula-cell">
                            <span class="pelicula-titulo">{{ peliculaTitulo(f.id_pelicula) }}</span>
                            <span class="pelicula-meta">
                              {{ peliculaDuracion(f.id_pelicula) }} min
                            </span>
                          </div>
                        </td>
                        <td class="col-sala">
                          <div class="sala-cell">
                            <div class="sala-cine">{{ cineNombre(f.id_cine) }}</div>
                            <div class="sala-nombre">Sala {{ salaNombre(f.id_cine, f.id_sala) }}</div>
                          </div>
                        </td>
                        <td class="col-ocupacion">
                          @let cap = capacidad(f.id_cine, f.id_sala);
                          @let pct = cap ? Math.round(f.boletos_vendidos / cap * 100) : 0;
                          <div class="ocupacion">
                            <div class="ocupacion-bar">
                              <div
                                class="ocupacion-fill"
                                [class.med]="pct >= 60 && pct < 90"
                                [class.high]="pct >= 90"
                                [style.width.%]="pct"
                              ></div>
                            </div>
                            <span class="ocupacion-pct tnum">{{ pct }}%</span>
                          </div>
                        </td>
                        <td>
                          <span class="estado-badge" [class]="'estado-badge ' + f.estado">
                            {{ estadoLabel(f.estado) }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <a
                              class="icon-btn"
                              [routerLink]="['/admin/funciones', f.id, 'editar']"
                              [class.disabled]="f.estado !== 'programada'"
                              [attr.aria-disabled]="f.estado !== 'programada'"
                              title="Editar"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </a>
                            <a
                              class="icon-btn danger"
                              [routerLink]="['/admin/funciones', f.id, 'cancelar']"
                              [class.disabled]="f.estado !== 'programada'"
                              [attr.aria-disabled]="f.estado !== 'programada'"
                              title="Cancelar"
                            >
                              <svg lucideX [size]="16"></svg>
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
  styleUrl: './funciones.component.scss',
})
export class AdminFuncionesComponent {
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private router = inject(Router);

  readonly Math = Math;

  readonly funciones = signal<Funcion[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly filtro = signal<Filtro>('todas');
  readonly idCiudad = signal<string>('');
  readonly idCine = signal<string>('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly toast = signal<Toast>(null);

  readonly peliculasById = computed(() => {
    const map = new Map<string, Pelicula>();
    for (const p of this.peliculas()) map.set(p.id, p);
    return map;
  });
  readonly cinesById = computed(() => {
    const map = new Map<string, Cine>();
    for (const c of this.cines()) map.set(c.id, c);
    return map;
  });

  readonly funcionesHoy = computed(() => {
    return this.funciones().filter((f) => this.isToday(f.fecha_hora)).length;
  });
  readonly totalProgramadas = computed(
    () => this.funciones().filter((f) => f.estado === 'programada').length,
  );

  readonly cinesEnCiudad = computed(() => {
    const ciudadId = this.idCiudad();
    if (!ciudadId) return this.cines();
    return this.cines().filter((c) => c.id_ciudad === ciudadId);
  });

  readonly filtered = computed(() => {
    const now = Date.now();
    const f = this.filtro();
    const cidad = this.idCiudad();
    const cine = this.idCine();
    const cinesOfCiudad = cidad
      ? new Set(this.cines().filter((c) => c.id_ciudad === cidad).map((c) => c.id))
      : null;
    return this.funciones().filter((x) => {
      const ts = new Date(x.fecha_hora).getTime();
      if (f === 'hoy' && !this.isToday(x.fecha_hora)) return false;
      if (f === 'proximas' && !(ts > now && !this.isToday(x.fecha_hora))) return false;
      if (f === 'pasadas' && !(ts < now && !this.isToday(x.fecha_hora))) return false;
      if (cinesOfCiudad && !cinesOfCiudad.has(x.id_cine)) return false;
      if (cine && x.id_cine !== cine) return false;
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
    this.peliculasSvc.list().subscribe((d) => this.peliculas.set(d.data));
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));

    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    if (state?.toast) this.showToast('ok', String(state.toast));

    effect(() => {
      const total = this.filtered().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  setFiltro(f: Filtro) {
    this.filtro.set(f);
    this.page.set(1);
  }

  onCiudadChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.idCiudad.set(val);
    this.idCine.set('');
    this.page.set(1);
  }

  onCineChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.idCine.set(val);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  peliculaTitulo(id: string): string {
    return this.peliculasById().get(id)?.titulo ?? '—';
  }
  peliculaDuracion(id: string): number {
    return this.peliculasById().get(id)?.duracion_min ?? 0;
  }
  cineNombre(id: string): string {
    return this.cinesById().get(id)?.nombre ?? '—';
  }
  salaNombre(idCine: string, idSala: string): string {
    const sala = this.cinesById()
      .get(idCine)
      ?.salas.find((s) => s.id === idSala);
    return sala?.nombre ?? '—';
  }
  capacidad(idCine: string, idSala: string): number {
    const sala = this.cinesById()
      .get(idCine)
      ?.salas.find((s) => s.id === idSala);
    return sala ? (sala.filas ?? 0) * (sala.columnas ?? 0) : 0;
  }
  estadoLabel(e: Funcion['estado']): string {
    switch (e) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En curso';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
    }
  }

  dayLabel(iso: string): string {
    if (this.isToday(iso)) return 'Hoy';
    const d = new Date(iso);
    const today = new Date();
    const diff = Math.floor(
      (d.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86400000,
    );
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    return new Date(iso).toLocaleDateString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  private isToday(iso: string): boolean {
    const d = new Date(iso);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  }

  private refresh() {
    this.funcionesSvc.list().subscribe((data) => this.funciones.set(data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
