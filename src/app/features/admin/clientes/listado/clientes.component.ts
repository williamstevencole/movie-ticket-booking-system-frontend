import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucidePower,
  LucidePowerOff,
  LucideUserRound,
  LucideMail,
  LucidePhone,
  LucideRefreshCw,
} from '@lucide/angular';

import {
  Cliente,
  ClientesService,
  EstadoCliente,
  ListClientesQuery,
} from '../../../../shared/services/clientes.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { extractMessage } from '../../../../shared/utils/http-errors';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

type EstadoFiltro = 'todos' | 'activos' | 'bloqueados';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    PagerComponent,
    LucideSearch,
    LucidePower,
    LucidePowerOff,
    LucideUserRound,
    LucideMail,
    LucidePhone,
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
            <span class="crumb-current">Clientes</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Clientes</h1>
              <p class="lead">
                @if (loading() && total() === 0) {
                  Cargando…
                } @else {
                  {{ total() }} en total
                }
              </p>
            </div>
          </div>

          <section class="toolbar">
            <div class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                type="search"
                placeholder="Buscar cliente…"
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
                [class.on]="estadoFiltro() === 'bloqueados'"
                (click)="setEstadoFiltro('bloqueados')"
              >Bloqueados</button>
            </div>
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
            @if (loading() && clientes().length === 0) {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th class="col-tel">Teléfono</th>
                      <th class="col-num">Reservas</th>
                      <th class="col-fecha">Registro</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (_ of skeletonRows; track $index) {
                      <tr class="row-skeleton">
                        <td colspan="6"><span class="skeleton-bar"></span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (clientes().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideUserRound [size]="22"></svg>
                </span>
                <h3>Sin clientes</h3>
                @if (busqueda() || estadoFiltro() !== 'todos') {
                  <p>No hay clientes que coincidan con los filtros.</p>
                } @else {
                  <p>Aún no hay clientes registrados.</p>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th class="col-tel">Teléfono</th>
                      <th class="col-num">Reservas</th>
                      <th class="col-fecha">Registro</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of clientes(); track c.id) {
                      <tr [class.is-inactive]="c.estado === 'bloqueado'">
                        <td>
                          <div class="cliente-cell">
                            <span class="cliente-avatar">{{ iniciales(c.nombre) }}</span>
                            <div class="cliente-info">
                              <span class="cliente-nombre">{{ c.nombre }}</span>
                              <span class="cliente-email">
                                <svg lucideMail [size]="11"></svg>
                                {{ c.email }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="col-tel">
                          @if (c.telefono) {
                            <span class="tel-cell">
                              <svg lucidePhone [size]="13"></svg>
                              {{ c.telefono }}
                            </span>
                          } @else {
                            <span class="text-muted">—</span>
                          }
                        </td>
                        <td class="col-num">
                          <span class="tnum reservas-count">{{ c.num_reservas }}</span>
                        </td>
                        <td class="col-fecha">
                          <span class="fecha-registro">
                            {{ c.created_at | date:'dd/MM/yyyy' }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="estado-badge"
                            [class.activo]="c.estado === 'activo'"
                            [class.inactivo]="c.estado === 'bloqueado'"
                          >
                            {{ c.estado === 'activo' ? 'Activo' : 'Bloqueado' }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <button
                              class="icon-btn"
                              [class.danger]="c.estado === 'activo'"
                              [disabled]="bloqueando() === c.id"
                              (click)="toggleEstado(c)"
                              [title]="c.estado === 'activo' ? 'Bloquear' : 'Activar'"
                            >
                              @if (c.estado === 'activo') {
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
  styleUrl: './clientes.component.scss',
})
export class AdminClientesComponent {
  private clientesSvc = inject(ClientesService);
  private toast = inject(ToastService);

  readonly clientes = signal<Cliente[]>([]);
  readonly total = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly busqueda = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly bloqueando = signal<string | null>(null);

  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  private busquedaDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // dispara una carga cada vez que cambia un parámetro de búsqueda o paginación
    effect(() => {
      const query: ListClientesQuery = {
        page: this.page(),
        limit: this.pageSize(),
        busqueda: this.busqueda(),
        estado: this.estadoFiltroToEstado(this.estadoFiltro()),
      };
      this.fetch(query);
    });
  }

  private estadoFiltroToEstado(f: EstadoFiltro): EstadoCliente | undefined {
    if (f === 'activos') return 'activo';
    if (f === 'bloqueados') return 'bloqueado';
    return undefined;
  }

  private fetch(query: ListClientesQuery): void {
    this.loading.set(true);
    this.error.set(null);
    this.clientesSvc.list(query).subscribe({
      next: (res) => {
        this.clientes.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.clientes.set([]);
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
      busqueda: this.busqueda(),
      estado: this.estadoFiltroToEstado(this.estadoFiltro()),
    });
  }

  onBusqueda(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (this.busquedaDebounce) clearTimeout(this.busquedaDebounce);
    this.busquedaDebounce = setTimeout(() => {
      this.busqueda.set(value);
      this.page.set(1);
    }, 250);
  }

  setEstadoFiltro(f: EstadoFiltro): void {
    this.estadoFiltro.set(f);
    this.page.set(1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  toggleEstado(c: Cliente): void {
    if (c.estado === 'activo' && c.num_reservas > 0) {
      const ok = confirm(
        `¿Bloquear a ${c.nombre}? Tiene ${c.num_reservas} reservas activas.`,
      );
      if (!ok) return;
    }

    this.bloqueando.set(c.id);
    this.clientesSvc.toggleEstado(c.id, c.estado).subscribe({
      next: (updated) => {
        this.clientes.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        const accion = updated.estado === 'activo' ? 'activado' : 'bloqueado';
        this.toast.show(`${updated.nombre} ${accion}`);
        this.bloqueando.set(null);
      },
      error: (err) => {
        this.toast.show(`No se pudo cambiar el estado: ${extractMessage(err)}`);
        this.bloqueando.set(null);
      },
    });
  }
}
