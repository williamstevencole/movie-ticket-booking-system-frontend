import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideSearch, LucideCreditCard } from '@lucide/angular';

import { Pago, PagosService } from '../../../../shared/services/pagos.service';
import {
  Reembolso,
  ReembolsosService,
} from '../../../../shared/services/reembolsos.service';
import {
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../../../shared/services/reservas.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../../shared/components/export-button.component';

type Preset = '7d' | '30d' | 'mes' | 'custom';

@Component({
  selector: 'app-admin-reporte-pagos-reembolsos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    ExportButtonComponent,
    LucideSearch,
    LucideCreditCard,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/reportes/pagos-reembolsos">Reportes</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Pagos y reembolsos</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Historial de pagos y reembolsos</h1>
              <p class="lead">
                Transacciones financieras del período. El reembolsado se cruza con cada pago original.
              </p>
            </div>
            <app-export-button
              filename="pagos-reembolsos"
              [columns]="exportColumns"
              [rows]="filteredPagos()"
            />
          </div>

          <section class="kpi-grid">
            <div class="kpi">
              <span class="kpi-label">Transacciones</span>
              <span class="kpi-value tnum">{{ filteredPagos().length | number }}</span>
              <span class="kpi-sub">{{ kpis().exitosos }} exitosas</span>
            </div>
            <div class="kpi">
              <span class="kpi-label">Cobrado</span>
              <span class="kpi-value tnum">Q{{ kpis().cobrado | number }}</span>
              <span class="kpi-sub">Pagos exitosos</span>
            </div>
            <div class="kpi refund">
              <span class="kpi-label">Reembolsado</span>
              <span class="kpi-value tnum">Q{{ kpis().reembolsado | number }}</span>
              <span class="kpi-sub">{{ filteredReembolsos().length }} reembolsos</span>
            </div>
            <div class="kpi neto">
              <span class="kpi-label">Neto</span>
              <span class="kpi-value tnum">Q{{ kpis().neto | number }}</span>
              <span class="kpi-sub">Cobrado − reembolsado</span>
            </div>
          </section>

          <section class="toolbar">
            <div class="preset-group" role="tablist">
              <button
                class="preset-chip"
                [class.on]="preset() === '7d'"
                (click)="setPreset('7d')"
              >Últimos 7 días</button>
              <button
                class="preset-chip"
                [class.on]="preset() === '30d'"
                (click)="setPreset('30d')"
              >Últimos 30 días</button>
              <button
                class="preset-chip"
                [class.on]="preset() === 'mes'"
                (click)="setPreset('mes')"
              >Este mes</button>
              <button
                class="preset-chip"
                [class.on]="preset() === 'custom'"
                (click)="setPreset('custom')"
              >Personalizado</button>
            </div>

            @if (preset() === 'custom') {
              <input
                type="date"
                class="select-filter"
                style="min-width: 150px;"
                [(ngModel)]="customFrom"
                (ngModelChange)="onCustomChange()"
              />
              <input
                type="date"
                class="select-filter"
                style="min-width: 150px;"
                [(ngModel)]="customTo"
                (ngModelChange)="onCustomChange()"
              />
            }

            <label class="search">
              <svg lucideSearch [size]="14"></svg>
              <input
                type="text"
                placeholder="# transacción o reserva…"
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
              />
            </label>

            <select
              class="select-filter"
              [value]="metodo()"
              (change)="onMetodoChange($event)"
            >
              <option value="">Todos los métodos</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
            </select>

            <select
              class="select-filter"
              [value]="estado()"
              (change)="onEstadoChange($event)"
            >
              <option value="">Todos los estados</option>
              <option value="exitoso">Exitoso</option>
              <option value="procesando">Procesando</option>
              <option value="rechazado">Rechazado</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </section>

          <section class="card">
            <div class="card-head">
              <span class="card-title-h">Pagos</span>
              <span class="card-count tnum">
                {{ filteredPagos().length }} de {{ pagos().length }} transacciones en período
              </span>
            </div>

            @if (pagedPagos().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideCreditCard [size]="22"></svg>
                </span>
                <h3>Sin transacciones</h3>
                <p>Ajusta el rango o los filtros.</p>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th># Transacción</th>
                      <th>Reserva</th>
                      <th>Cliente</th>
                      <th>Método</th>
                      <th class="col-hide-sm">Fecha</th>
                      <th class="right">Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of pagedPagos(); track p.id) {
                      <tr>
                        <td>
                          <div class="cell-strong tnum">{{ p.referencia_externa || p.id }}</div>
                          @if (p.tarjeta_mask) {
                            <div class="cell-sub tnum">{{ p.tarjeta_mask }}</div>
                          }
                        </td>
                        <td class="tnum">{{ reservaNumero(p.id_reserva) }}</td>
                        <td>
                          <div class="cell-strong">{{ clienteDePago(p.id_reserva) }}</div>
                        </td>
                        <td>
                          <span class="cell-strong">
                            {{ p.metodo === 'tarjeta' ? 'Tarjeta' : 'Efectivo' }}
                          </span>
                        </td>
                        <td class="col-hide-sm tnum">
                          <div>{{ p.created_at | date: 'd MMM' }}</div>
                          <div class="cell-sub">{{ p.created_at | date: 'HH:mm' }}</div>
                        </td>
                        <td class="right">
                          <div class="cell-strong tnum">Q{{ p.monto_final | number }}</div>
                          @if (p.monto_descuento > 0) {
                            <div class="cell-sub tnum">−Q{{ p.monto_descuento }}</div>
                          }
                        </td>
                        <td>
                          <span class="badge" [class]="'badge ' + p.estado">
                            {{ estadoPagoLabel(p.estado) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5" class="label">Subtotal exitosos</td>
                      <td class="right tnum">Q{{ kpis().cobrado | number }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <app-pager
                [value]="{ page: page(), pageSize: pageSize(), total: filteredPagos().length }"
                (pageChange)="page.set($event)"
                (pageSizeChange)="onPageSizeChange($event)"
              />
            }
          </section>

          <section class="card">
            <div class="card-head">
              <span class="card-title-h">Reembolsos</span>
              <span class="card-count tnum">
                {{ filteredReembolsos().length }} en período
              </span>
            </div>

            @if (filteredReembolsos().length === 0) {
              <div class="empty">
                <h3>Sin reembolsos</h3>
                <p>No hay reembolsos en este rango.</p>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th># Reembolso</th>
                      <th>Pago asociado</th>
                      <th>Cliente</th>
                      <th class="right">% aplicado</th>
                      <th class="right">Monto</th>
                      <th class="col-hide-sm">Procesado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (rb of filteredReembolsos(); track rb.id) {
                      <tr>
                        <td><span class="cell-strong tnum">{{ rb.id }}</span></td>
                        <td class="tnum">{{ pagoRef(rb.id_pago) }}</td>
                        <td>
                          <span class="cell-strong">{{ clienteDeReembolso(rb.id_pago) }}</span>
                        </td>
                        <td class="right tnum">{{ rb.porcentaje_aplicado }}%</td>
                        <td class="right tnum cell-strong">Q{{ rb.monto | number }}</td>
                        <td class="col-hide-sm tnum">
                          {{ rb.fecha_procesado ? (rb.fecha_procesado | date: 'd MMM HH:mm') : '—' }}
                        </td>
                        <td>
                          <span class="badge" [class]="'badge ' + rb.estado">
                            {{ estadoReembolsoLabel(rb.estado) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="label">Total reembolsado</td>
                      <td class="right tnum">Q{{ kpis().reembolsado | number }}</td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrl: '../reportes.shared.scss',
})
export class AdminReportePagosReembolsosComponent {
  private pagosSvc = inject(PagosService);
  private reembolsosSvc = inject(ReembolsosService);
  private reservasSvc = inject(ReservasService);

  readonly pagos = signal<Pago[]>([]);
  readonly reembolsos = signal<Reembolso[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly usuarios = signal<ReservaUsuario[]>([]);

  readonly preset = signal<Preset>('30d');
  readonly searchTerm = signal('');
  readonly metodo = signal<string>('');
  readonly estado = signal<string>('');
  readonly page = signal(1);
  readonly pageSize = signal(20);

  customFrom = '';
  customTo = '';

  readonly exportColumns: ExportColumn<Pago>[] = [
    { key: 'id', label: '# Transacción', value: (p) => p.referencia_externa || p.id },
    { key: 'reserva', label: 'Reserva', value: (p) => this.reservaNumero(p.id_reserva) },
    { key: 'cliente', label: 'Cliente', value: (p) => this.clienteDePago(p.id_reserva) },
    { key: 'metodo', label: 'Método', value: (p) => p.metodo },
    { key: 'tarjeta', label: 'Tarjeta', value: (p) => p.tarjeta_mask ?? '' },
    { key: 'monto_original', label: 'Monto original', value: (p) => p.monto_original },
    { key: 'monto_descuento', label: 'Descuento', value: (p) => p.monto_descuento },
    { key: 'monto_final', label: 'Monto final', value: (p) => p.monto_final },
    { key: 'estado', label: 'Estado', value: (p) => p.estado },
    { key: 'fecha', label: 'Fecha', value: (p) => p.created_at },
  ];

  readonly reservasById = computed(() => {
    const map = new Map<string, Reserva>();
    for (const r of this.reservas()) map.set(r.id, r);
    return map;
  });
  readonly usuariosById = computed(() => {
    const map = new Map<string, ReservaUsuario>();
    for (const u of this.usuarios()) map.set(u.id, u);
    return map;
  });
  readonly pagosById = computed(() => {
    const map = new Map<string, Pago>();
    for (const p of this.pagos()) map.set(p.id, p);
    return map;
  });

  readonly range = computed<{ from: number; to: number }>(() => {
    const now = Date.now();
    switch (this.preset()) {
      case '7d':
        return { from: now - 7 * 86_400_000, to: now };
      case '30d':
        return { from: now - 30 * 86_400_000, to: now };
      case 'mes': {
        const d = new Date();
        return {
          from: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
          to: now,
        };
      }
      case 'custom':
        return {
          from: this.customFrom ? new Date(this.customFrom).getTime() : -Infinity,
          to: this.customTo ? new Date(this.customTo).getTime() + 86_400_000 : Infinity,
        };
    }
  });

  readonly filteredPagos = computed(() => {
    const { from, to } = this.range();
    const term = this.searchTerm().trim().toLowerCase();
    const met = this.metodo();
    const est = this.estado();
    return this.pagos().filter((p) => {
      const ts = new Date(p.created_at).getTime();
      if (ts < from || ts > to) return false;
      if (met && p.metodo !== met) return false;
      if (est && p.estado !== est) return false;
      if (term) {
        const reserva = this.reservasById().get(p.id_reserva);
        const ref = (p.referencia_externa ?? p.id).toLowerCase();
        const num = (reserva?.numero_reserva ?? '').toLowerCase();
        if (!ref.includes(term) && !num.includes(term)) return false;
      }
      return true;
    });
  });

  readonly pagedPagos = computed(() => {
    const all = this.filteredPagos();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  readonly filteredReembolsos = computed(() => {
    const pagoIds = new Set(this.filteredPagos().map((p) => p.id));
    return this.reembolsos().filter((rb) => pagoIds.has(rb.id_pago));
  });

  readonly kpis = computed(() => {
    let cobrado = 0;
    let reembolsado = 0;
    let exitosos = 0;
    for (const p of this.filteredPagos()) {
      if (p.estado === 'exitoso') {
        cobrado += p.monto_final;
        exitosos++;
      }
    }
    for (const rb of this.filteredReembolsos()) {
      reembolsado += rb.monto;
    }
    return { cobrado, reembolsado, neto: cobrado - reembolsado, exitosos };
  });

  constructor() {
    this.pagosSvc.list().subscribe((d) => this.pagos.set(d));
    this.reembolsosSvc.list().subscribe((d) => this.reembolsos.set(d));
    this.reservasSvc.list().subscribe((d) => this.reservas.set(d));
    this.reservasSvc.listUsuarios().subscribe((d) => this.usuarios.set(d));

    effect(() => {
      const total = this.filteredPagos().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  setPreset(p: Preset) { this.preset.set(p); this.page.set(1); }
  onCustomChange() { this.page.set(1); }
  onSearchChange(v: string) { this.searchTerm.set(v); this.page.set(1); }
  onMetodoChange(e: Event) {
    this.metodo.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  onEstadoChange(e: Event) {
    this.estado.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  onPageSizeChange(s: number) { this.pageSize.set(s); this.page.set(1); }

  reservaNumero(idReserva: string): string {
    return this.reservasById().get(idReserva)?.numero_reserva ?? '—';
  }
  clienteDePago(idReserva: string): string {
    const r = this.reservasById().get(idReserva);
    return r ? this.usuariosById().get(r.id_usuario)?.nombre ?? '—' : '—';
  }
  clienteDeReembolso(idPago: string): string {
    const pago = this.pagosById().get(idPago);
    return pago ? this.clienteDePago(pago.id_reserva) : '—';
  }
  pagoRef(idPago: string): string {
    const p = this.pagosById().get(idPago);
    return p ? p.referencia_externa ?? p.id : '—';
  }
  estadoPagoLabel(e: Pago['estado']): string {
    switch (e) {
      case 'exitoso': return 'Exitoso';
      case 'procesando': return 'Procesando';
      case 'rechazado': return 'Rechazado';
      case 'reembolsado': return 'Reembolsado';
    }
  }
  estadoReembolsoLabel(e: Reembolso['estado']): string {
    switch (e) {
      case 'procesado': return 'Procesado';
      case 'pendiente': return 'Pendiente';
      case 'rechazado': return 'Rechazado';
    }
  }
}
