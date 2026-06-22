import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucidePower,
  LucidePowerOff,
  LucideUserRound,
  LucideMail,
  LucidePhone,
} from '@lucide/angular';

import { Cliente, ClientesService } from '../../../../shared/services/clientes.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
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
                {{ totalActivos() }} activos · {{ clientes().length }} en total
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

            <span class="result-count tnum">
              {{ filtered().length }} de {{ clientes().length }}
            </span>
          </section>

          <section class="card">
            @if (paged().length === 0) {
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
                    @for (c of paged(); track c.id) {
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
  styleUrl: './clientes.component.scss',
})
export class AdminClientesComponent {
  private clientesSvc = inject(ClientesService);

  readonly clientes = signal<Cliente[]>([]);

  readonly busqueda = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly toast = signal<Toast>(null);
  readonly bloqueando = signal<string | null>(null);

  readonly totalActivos = computed(
    () => this.clientes().filter((c) => c.estado === 'activo').length,
  );

  readonly filtered = computed(() => {
    const needle = this.busqueda().trim().toLowerCase();
    const estado = this.estadoFiltro();
    return this.clientes().filter((c) => {
      if (estado === 'activos' && c.estado !== 'activo') return false;
      if (estado === 'bloqueados' && c.estado !== 'bloqueado') return false;
      if (needle) {
        const haystack = `${c.nombre} ${c.email} ${c.telefono ?? ''}`.toLowerCase();
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
    this.clientesSvc.list().subscribe((lista) => this.clientes.set(lista));

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

  onPageSizeChange(size: number) {
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

  toggleEstado(c: Cliente) {
    if (c.estado === 'activo' && c.num_reservas > 0) {
      const ok = confirm(
        `¿Bloquear a ${c.nombre}? Tiene ${c.num_reservas} reservas activas.`,
      );
      if (!ok) return;
    }

    this.bloqueando.set(c.id);
    this.clientesSvc.toggleEstado(c.id).subscribe({
      next: (updated) => {
        this.clientes.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        const accion = updated.estado === 'activo' ? 'activado' : 'bloqueado';
        this.showToast('ok', `${updated.nombre} ${accion}`);
        this.bloqueando.set(null);
      },
      error: () => {
        this.showToast('err', 'No se pudo cambiar el estado. Inténtalo de nuevo.');
        this.bloqueando.set(null);
      },
    });
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
