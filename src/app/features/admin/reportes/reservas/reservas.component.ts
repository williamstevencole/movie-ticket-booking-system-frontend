import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideClipboardList } from '@lucide/angular';
import { Subject, EMPTY, switchMap, catchError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ReportesService,
  ReporteReservaRow,
} from '../../../../shared/services/reportes.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import {
  ReportFiltrosComponent,
  ReportFiltrosValue,
} from '../../../../shared/components/report-filtros.component';
import { extractMessage } from '../../../../shared/utils/http-errors';
import {
  ExportColumn,
  downloadReportCsv,
  downloadReportPdf,
} from '../../../../shared/utils/report-export';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-reporte-reservas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    ReportFiltrosComponent,
    LucideClipboardList,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/reportes/reservas">Reportes</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Reservas</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Reporte de reservas</h1>
              <p class="lead">
                Operación comercial en el período seleccionado. Cobrado, reembolsado y neto al pie.
              </p>
            </div>
            <div class="export-actions">
              <button
                class="btn"
                (click)="exportar('csv')"
                [disabled]="exportando() || total() === 0"
              >
                {{ exportando() ? 'Exportando…' : 'Exportar CSV' }}
              </button>
              <button
                class="btn"
                (click)="exportar('pdf')"
                [disabled]="exportando() || total() === 0"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          <section class="kpi-grid">
            <div class="kpi">
              <span class="kpi-label">Reservas</span>
              <span class="kpi-value tnum">{{ total() | number }}</span>
              <span class="kpi-sub">{{ kpis().pagadas }} pagadas</span>
            </div>
            <div class="kpi">
              <span class="kpi-label">Cobrado</span>
              <span class="kpi-value tnum">L {{ kpis().cobrado | number }}</span>
              <span class="kpi-sub">Solo reservas pagadas</span>
            </div>
            <div class="kpi refund">
              <span class="kpi-label">Reembolsado</span>
              <span class="kpi-value tnum">L {{ kpis().reembolsado | number }}</span>
              <span class="kpi-sub">{{ kpis().reembolsadas }} reservas</span>
            </div>
            <div class="kpi neto">
              <span class="kpi-label">Neto</span>
              <span class="kpi-value tnum">L {{ kpis().neto | number }}</span>
              <span class="kpi-sub">Cobrado − reembolsado</span>
            </div>
          </section>

          <app-report-filtros
            [config]="{
              periodo: true,
              search: { placeholder: '# reserva o cliente…' },
              selects: ['cine', 'ciudad', 'pelicula', 'estado-reserva']
            }"
            [value]="filtros()"
            (valueChange)="onFiltrosChange($event)"
          />

          <section class="card">
            <div class="card-head">
              <span class="card-title-h">Detalle</span>
              <span class="card-count tnum">
                {{ total() }} reservas en período
              </span>
            </div>

            @if (reservasError(); as msg) {
              <div class="error-banner">
                <span>{{ msg }}</span>
                <button type="button" class="btn" (click)="reload()">Reintentar</button>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th># Reserva</th>
                      <th>Cliente</th>
                      <th class="col-hide-sm">Película · cine</th>
                      <th>Función</th>
                      <th class="right">Asientos</th>
                      <th class="right">Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (reservasLoading() && reservas().length === 0) {
                      @for (i of [1,2,3,4,5]; track i) {
                        <tr class="skeleton-row">
                          <td colspan="7"><div class="skeleton"></div></td>
                        </tr>
                      }
                    } @else if (reservas().length === 0) {
                      <tr>
                        <td colspan="7">
                          <div class="empty">
                            <span class="empty-mark">
                              <svg lucideClipboardList [size]="22"></svg>
                            </span>
                            <h3>Sin reservas</h3>
                            <p>Ajusta el rango de fechas o los filtros.</p>
                          </div>
                        </td>
                      </tr>
                    } @else {
                      @for (r of reservas(); track r.id) {
                        <tr>
                          <td><span class="cell-strong tnum">{{ r.numero_reserva }}</span></td>
                          <td>
                            <div class="cell-strong">{{ r.nombre_usuario }}</div>
                            <div class="cell-sub">{{ r.email_usuario }}</div>
                          </td>
                          <td class="col-hide-sm">
                            <div class="cell-strong">{{ r.titulo_pelicula }}</div>
                            <div class="cell-sub">{{ r.nombre_cine }} · {{ r.nombre_sala }}</div>
                          </td>
                          <td class="tnum">
                            <div>{{ r.fecha_hora_funcion | date: 'd MMM' }}</div>
                            <div class="cell-sub">{{ r.fecha_hora_funcion | date: 'HH:mm' }}</div>
                          </td>
                          <td class="right tnum">{{ r.num_asientos }}</td>
                          <td class="right tnum cell-strong">L {{ r.monto_total | number }}</td>
                          <td>
                            <span class="badge" [class]="'badge ' + r.estado">
                              {{ estadoLabel(r.estado) }}
                            </span>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                  @if (reservas().length > 0) {
                    <tfoot>
                      <tr>
                        <td colspan="5" class="label">Totales</td>
                        <td class="right tnum">L {{ totalsRow() | number }}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  }
                </table>
              </div>

              @if (reservas().length > 0) {
                <app-pager
                  [value]="{ page: page(), pageSize: pageSize(), total: total() }"
                  (pageChange)="onPageChange($event)"
                  (pageSizeChange)="onPageSizeChange($event)"
                />
              }
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrl: '../reportes.shared.scss',
})
export class AdminReporteReservasComponent {
  private reportesSvc = inject(ReportesService);
  private readonly toast = inject(ToastService);

  readonly reservas = signal<ReporteReservaRow[]>([]);
  readonly total = signal(0);
  readonly reservasLoading = signal(false);
  readonly reservasError = signal<string | null>(null);
  readonly exportando = signal(false);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly kpis = computed(() => {
    const rows = this.reservas();
    let cobrado = 0;
    let reembolsado = 0;
    let pagadas = 0;
    let reembolsadas = 0;
    for (const r of rows) {
      if (r.estado === 'pagada') {
        cobrado += r.monto_total;
        pagadas++;
      }
      if (r.estado === 'reembolsada') {
        reembolsado += r.monto_total;
        reembolsadas++;
      }
    }
    return { cobrado, reembolsado, neto: cobrado - reembolsado, pagadas, reembolsadas };
  });

  readonly totalsRow = computed(() =>
    this.reservas().reduce((sum, r) => sum + r.monto_total, 0),
  );

  private readonly query$ = new Subject<Record<string, any>>();

  constructor() {
    this.query$
      .pipe(
        switchMap((q) => {
          this.reservasLoading.set(true);
          this.reservasError.set(null);
          return this.reportesSvc.reservas(q).pipe(
            catchError((err) => {
              this.reservasError.set(extractMessage(err));
              this.reservasLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.reservas.set(res.data);
        this.total.set(res.total);
        this.reservasLoading.set(false);
      });

    this.cargar();
  }

  private buildQuery(): Record<string, any> {
    const f = this.filtros();
    const q: Record<string, any> = {
      page: this.page(),
      limit: this.pageSize(),
    };

    if (f.search) q['search'] = f.search;
    if (f.selects['cine']) q['id_cine'] = f.selects['cine'];
    if (f.selects['ciudad']) q['id_ciudad'] = f.selects['ciudad'];
    if (f.selects['pelicula']) q['id_pelicula'] = f.selects['pelicula'];
    if (f.selects['estado-reserva']) q['estado'] = f.selects['estado-reserva'];

    const periodo = f.periodo;
    if (periodo) {
      const now = new Date();
      switch (periodo.preset) {
        case '7d':
          q['desde'] = new Date(Date.now() - 7 * 86_400_000).toISOString();
          q['hasta'] = now.toISOString();
          break;
        case '30d':
          q['desde'] = new Date(Date.now() - 30 * 86_400_000).toISOString();
          q['hasta'] = now.toISOString();
          break;
        case 'mes': {
          const d = new Date();
          q['desde'] = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
          q['hasta'] = now.toISOString();
          break;
        }
        case 'custom':
          if (periodo.from) q['desde'] = new Date(periodo.from).toISOString();
          if (periodo.to) q['hasta'] = new Date(periodo.to + 'T23:59:59').toISOString();
          break;
      }
    }

    return q;
  }

  private cargar() {
    this.query$.next(this.buildQuery());
  }

  reload(): void {
    this.cargar();
  }

  /** Columnas exportadas (alineadas con la tabla en pantalla). */
  readonly exportColumns: ExportColumn<ReporteReservaRow>[] = [
    { key: 'numero_reserva', label: '# Reserva', value: (r) => r.numero_reserva },
    { key: 'cliente', label: 'Cliente', value: (r) => r.nombre_usuario },
    { key: 'email', label: 'Email', value: (r) => r.email_usuario },
    { key: 'pelicula', label: 'Película', value: (r) => r.titulo_pelicula },
    { key: 'cine', label: 'Cine', value: (r) => r.nombre_cine },
    { key: 'sala', label: 'Sala', value: (r) => r.nombre_sala },
    {
      key: 'funcion',
      label: 'Función',
      value: (r) =>
        new Date(r.fecha_hora_funcion).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    { key: 'asientos', label: 'Asientos', value: (r) => r.num_asientos },
    { key: 'total', label: 'Total (L)', value: (r) => r.monto_total.toFixed(2) },
    { key: 'estado', label: 'Estado', value: (r) => this.estadoLabel(r.estado) },
  ];

  /** Exporta TODAS las reservas del período (no solo la página actual). */
  exportar(format: 'csv' | 'pdf') {
    if (this.exportando()) return;
    const q = this.buildQuery();
    q['page'] = 1;
    q['limit'] = Math.max(this.total(), 1);
    this.exportando.set(true);
    this.reportesSvc.reservas(q).subscribe({
      next: (res) => {
        const opts = {
          filename: `reporte-reservas-${new Date().toISOString().slice(0, 10)}`,
          title: 'Reporte de reservas',
          columns: this.exportColumns,
          rows: res.data,
        };
        try {
          if (format === 'csv') downloadReportCsv(opts);
          else downloadReportPdf(opts);
          this.toast.show(
            `${format.toUpperCase()} descargado · ${res.data.length} registros`,
          );
        } catch {
          this.toast.show(`No se pudo generar el ${format.toUpperCase()}`);
        }
        this.exportando.set(false);
      },
      error: (err) => {
        this.toast.show(extractMessage(err));
        this.exportando.set(false);
      },
    });
  }

  onFiltrosChange(v: ReportFiltrosValue) {
    this.filtros.set(v);
    this.page.set(1);
    this.cargar();
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.cargar();
  }

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.page.set(1);
    this.cargar();
  }

  estadoLabel(e: ReporteReservaRow['estado']): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
    }
  }
}
