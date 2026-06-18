import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideTrash2,
  LucideGift,
  LucideSearch,
  LucidePower,
  LucidePowerOff,
  LucideTriangleAlert,
} from '@lucide/angular';

import { Cupon, CuponesService } from '../../../../shared/services/cupones.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import { ToastService } from '../../../../shared/services/toast.service';

type EstadoCupon = 'activo' | 'inactivo' | 'expirado';
type EstadoFiltro = 'todos' | EstadoCupon;
type TipoFiltro = 'todos' | 'porcentaje' | 'monto';

const POR_EXPIRAR_DIAS = 7;

@Component({
  selector: 'app-admin-cupones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    PagerComponent,
    LucidePlus,
    LucideTrash2,
    LucideGift,
    LucideSearch,
    LucidePower,
    LucidePowerOff,
    LucideTriangleAlert,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Cupones</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Cupones</h1>
              <p class="lead">
                {{ totalActivos() }} activos · {{ cupones().length }} en total
              </p>
            </div>
            <a routerLink="/admin/cupones/crear" class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nuevo cupón</span>
            </a>
          </div>

          @if (porExpirarCount() > 0) {
            <div class="warn-banner">
              <svg lucideTriangleAlert [size]="16"></svg>
              <span>
                {{ porExpirarCount() }}
                {{ porExpirarCount() === 1 ? 'cupón vence' : 'cupones vencen' }}
                en {{ POR_EXPIRAR_DIAS }} días o menos.
              </span>
            </div>
          }

          <section class="toolbar">
            <div class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                type="search"
                placeholder="Buscar por código…"
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
                [class.on]="estadoFiltro() === 'activo'"
                (click)="setEstadoFiltro('activo')"
              >Activos</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'inactivo'"
                (click)="setEstadoFiltro('inactivo')"
              >Inactivos</button>
              <button
                class="filter-chip"
                [class.on]="estadoFiltro() === 'expirado'"
                (click)="setEstadoFiltro('expirado')"
              >Expirados</button>
            </div>

            <select
              class="select-filter"
              [value]="tipoFiltro()"
              (change)="onTipoChange($event)"
            >
              <option value="todos">Todos los tipos</option>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto">Monto fijo</option>
            </select>

            <span class="result-count tnum">
              {{ filtered().length }} de {{ cupones().length }}
            </span>
          </section>

          <section class="card">
            @if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideGift [size]="22"></svg>
                </span>
                <h3>Sin cupones</h3>
                @if (busqueda() || tipoFiltro() !== 'todos' || estadoFiltro() !== 'todos') {
                  <p>No hay cupones que coincidan con los filtros.</p>
                } @else {
                  <p>Aún no hay cupones registrados.</p>
                  <a routerLink="/admin/cupones/crear" class="btn btn-primary btn-sm">
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
                      <th>Código</th>
                      <th>Tipo</th>
                      <th class="col-num">Valor</th>
                      <th>Vence</th>
                      <th class="col-num">Usos</th>
                      <th class="col-num">Descontado</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of paged(); track c.id) {
                      <tr [class.is-inactive]="estado(c) !== 'activo'">
                        <td>
                          <div class="cupon-cell">
                            <span class="cupon-mark">
                              <svg lucideGift [size]="16"></svg>
                            </span>
                            <span class="cupon-code">{{ c.codigo }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="tipo-name">{{ tipoLabel(c) }}</span>
                        </td>
                        <td class="col-num">
                          <span class="tnum valor">{{ valorDisplay(c) }}</span>
                        </td>
                        <td>
                          <div class="vence">
                            <span>{{ fechaCorta(c.fecha_expiracion) }}</span>
                            @if (porExpirar(c)) {
                              <span class="vence-chip">
                                vence en {{ diasParaExpirar(c) }}d
                              </span>
                            }
                          </div>
                        </td>
                        <td class="col-num">
                          <span class="tnum usos">{{ usosDisplay(c) }}</span>
                        </td>
                        <td class="col-num">
                          <span class="tnum descontado">{{ montoDisplay(c) }}</span>
                        </td>
                        <td>
                          <span class="estado-badge" [class]="'e-' + estado(c)">
                            {{ estadoLabel(estado(c)) }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <button
                              class="icon-btn"
                              [class.danger]="estado(c) === 'activo'"
                              [disabled]="estado(c) === 'expirado'"
                              (click)="toggleEstado(c)"
                              [title]="
                                estado(c) === 'expirado'
                                  ? 'Cupón vencido'
                                  : c.activo
                                    ? 'Desactivar'
                                    : 'Activar'
                              "
                            >
                              @if (c.activo) {
                                <svg lucidePower [size]="15"></svg>
                              } @else {
                                <svg lucidePowerOff [size]="15"></svg>
                              }
                            </button>
                            <button
                              class="icon-btn"
                              [class.danger]="c.usos_actuales === 0"
                              [disabled]="c.usos_actuales > 0"
                              (click)="eliminar(c)"
                              [title]="
                                c.usos_actuales > 0
                                  ? 'No se puede eliminar: ya tiene usos'
                                  : 'Eliminar'
                              "
                            >
                              <svg lucideTrash2 [size]="15"></svg>
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
  styleUrl: './cupones.component.scss',
})
export class AdminCuponesComponent {
  private cuponesSvc = inject(CuponesService);
  private toast = inject(ToastService);

  readonly POR_EXPIRAR_DIAS = POR_EXPIRAR_DIAS;

  readonly cupones = signal<Cupon[]>([]);
  readonly busqueda = signal<string>('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');
  readonly tipoFiltro = signal<TipoFiltro>('todos');

  readonly page = signal(1);
  readonly pageSize = signal(10);

  readonly totalActivos = computed(
    () => this.cupones().filter((c) => this.estado(c) === 'activo').length,
  );

  readonly porExpirarCount = computed(
    () => this.cupones().filter((c) => this.porExpirar(c)).length,
  );

  readonly filtered = computed(() => {
    const needle = this.busqueda().trim().toLowerCase();
    const estado = this.estadoFiltro();
    const tipo = this.tipoFiltro();
    return this.cupones().filter((c) => {
      if (estado !== 'todos' && this.estado(c) !== estado) return false;
      if (tipo !== 'todos' && this.tipoBase(c) !== tipo) return false;
      if (needle && !c.codigo.toLowerCase().includes(needle)) return false;
      return true;
    });
  });

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  constructor() {
    this.cuponesSvc.list().subscribe((c) => this.cupones.set(c));

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

  onTipoChange(e: Event) {
    this.tipoFiltro.set((e.target as HTMLSelectElement).value as TipoFiltro);
    this.page.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
  }

  estado(c: Cupon): EstadoCupon {
    if (new Date(c.fecha_expiracion).getTime() < Date.now()) return 'expirado';
    return c.activo ? 'activo' : 'inactivo';
  }

  estadoLabel(e: EstadoCupon): string {
    return e === 'activo' ? 'Activo' : e === 'inactivo' ? 'Inactivo' : 'Expirado';
  }

  private tipoBase(c: Cupon): 'porcentaje' | 'monto' {
    return c.tipo === 'porcentaje' ? 'porcentaje' : 'monto';
  }

  tipoLabel(c: Cupon): string {
    return this.tipoBase(c) === 'porcentaje' ? 'Porcentaje' : 'Monto fijo';
  }

  valorDisplay(c: Cupon): string {
    const v = Number(c.valor);
    return this.tipoBase(c) === 'porcentaje' ? `${v}%` : `L ${v}`;
  }

  usosDisplay(c: Cupon): string {
    return `${c.usos_actuales} / ${c.usos_maximos ?? '∞'}`;
  }

  montoDisplay(c: Cupon): string {
    return c.monto_descontado !== undefined
      ? `L ${c.monto_descontado.toLocaleString('es-HN')}`
      : '—';
  }

  fechaCorta(iso: string): string {
    return new Date(iso).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  diasParaExpirar(c: Cupon): number {
    const ms = new Date(c.fecha_expiracion).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  porExpirar(c: Cupon): boolean {
    return this.estado(c) !== 'expirado' && this.diasParaExpirar(c) <= POR_EXPIRAR_DIAS;
  }

  toggleEstado(c: Cupon) {
    if (this.estado(c) === 'expirado') {
      this.toast.show('No se puede activar un cupón vencido');
      return;
    }
    const next = !c.activo;
    this.cuponesSvc.setActivo(c.id, next).subscribe({
      next: (updated) => {
        this.cupones.update((list) =>
          list.map((x) => (x.id === updated.id ? updated : x)),
        );
        this.toast.show(`${c.codigo} ${next ? 'activado' : 'desactivado'}`);
      },
      error: (e) => this.toast.show(e?.message ?? 'No se pudo actualizar el cupón'),
    });
  }

  eliminar(c: Cupon) {
    if (c.usos_actuales > 0) {
      this.toast.show('No se puede eliminar un cupón que ya tiene usos');
      return;
    }
    this.cuponesSvc.remove(c.id).subscribe({
      next: () => {
        this.cupones.update((list) => list.filter((x) => x.id !== c.id));
        this.toast.show(`${c.codigo} eliminado`);
      },
      error: (e) => this.toast.show(e?.message ?? 'No se pudo eliminar el cupón'),
    });
  }
}
