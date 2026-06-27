import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ReportesService,
  CancelacionesReporte,
} from '../../../../shared/services/reportes.service';
import { extractMessage } from '../../../../shared/utils/http-errors';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import {
  ReportFiltrosComponent,
  ReportFiltrosValue,
} from '../../../../shared/components/report-filtros.component';

@Component({
  selector: 'app-admin-reporte-estadisticas-cancelacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DecimalPipe,
    AdminSidebarComponent,
    ReportFiltrosComponent,
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
            <span class="crumb-current">Estadísticas de cancelación</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Estadísticas de cancelación</h1>
              <p class="lead">
                Comportamiento de cancelaciones por política y tendencia reciente.
              </p>
            </div>
          </div>

          <app-report-filtros
            [config]="{ periodo: true, selects: ['cine', 'politica-cancelacion'] }"
            [value]="filtros()"
            (valueChange)="onFiltrosChange($event)"
          />

          @if (loading()) {
            <div class="empty-state"><p>Cargando…</p></div>
          } @else if (cancelacionesError()) {
            <div class="error-banner" role="alert">
              <span>{{ cancelacionesError() }}</span>
              <button type="button" class="btn btn-sm" (click)="reload()">Reintentar</button>
            </div>
          } @else if (!reporte()) {
            <div class="empty-state">
              <p>Sin datos de cancelaciones.</p>
            </div>
          } @else if (reporte()!.total_canceladas === 0) {
            <div class="empty-state">
              <p>Sin cancelaciones en este período.</p>
              <p class="muted">Ajustá los filtros para ver datos.</p>
            </div>
          } @else {
            <section class="kpi-grid">
              <div class="kpi">
                <span class="kpi-label">Cancelaciones</span>
                <span class="kpi-value tnum">{{ reporte()!.total_canceladas | number }}</span>
                <span class="kpi-sub">reservas afectadas</span>
              </div>
              <div class="kpi">
                <span class="kpi-label">Tasa</span>
                <span class="kpi-value tnum">{{ reporte()!.tasa | number: '1.1-1' }}%</span>
                <span class="kpi-sub">vs reservas creadas</span>
              </div>
            </section>

            <section class="panel">
              <div class="panel-head">
                <span class="panel-title">Por política</span>
              </div>
              @if (reporte()!.por_politica.length === 0) {
                <div class="empty">Sin datos en este período.</div>
              } @else {
                <div class="table-scroll">
                  <table class="tbl dense">
                    <thead>
                      <tr>
                        <th>Política</th>
                        <th class="right"># cancelaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of reporte()!.por_politica; track row.nombre) {
                        <tr>
                          <td><span class="cell-strong">{{ row.nombre }}</span></td>
                          <td class="right tnum">{{ row.count | number }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>

            <section class="panel">
              <div class="panel-head">
                <span class="panel-title">Por cine</span>
              </div>
              @if (reporte()!.por_cine.length === 0) {
                <div class="empty">Sin datos en este período.</div>
              } @else {
                <div class="table-scroll">
                  <table class="tbl dense">
                    <thead>
                      <tr>
                        <th>Cine</th>
                        <th class="right"># cancelaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of reporte()!.por_cine; track row.nombre) {
                        <tr>
                          <td><span class="cell-strong">{{ row.nombre }}</span></td>
                          <td class="right tnum">{{ row.count | number }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>

            <section class="panel">
              <div class="panel-head">
                <span class="panel-title">Tendencia últimos 30 días</span>
                <span class="panel-sub muted">Cancelaciones diarias</span>
              </div>

              @if (tendencia30d().length > 0) {
                <svg class="trend-chart" viewBox="0 0 600 220" role="img" aria-label="Cancelaciones por día">
                  @for (b of tendencia30d(); track b.fecha; let i = $index) {
                    <g [attr.transform]="'translate(' + (i * (600 / tendencia30d().length)) + ', 0)'">
                      <rect [attr.x]="2"
                            [attr.y]="180 - (maxCount() > 0 ? (b.count / maxCount() * 150) : 0)"
                            [attr.width]="Math.max(2, (600 / tendencia30d().length) - 4)"
                            [attr.height]="maxCount() > 0 ? (b.count / maxCount() * 150) : 0"
                            rx="2" class="bar">
                        <title>{{ b.fecha }} — {{ b.count }} cancelaciones</title>
                      </rect>
                    </g>
                  }
                </svg>
              }
            </section>
          }
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../reportes.shared.scss', './estadisticas-cancelacion.component.scss'],
})
export class AdminReporteEstadisticasCancelacionComponent {
  private reportesSvc = inject(ReportesService);

  readonly reporte = signal<CancelacionesReporte | null>(null);
  readonly loading = signal(false);
  readonly cancelacionesError = signal<string | null>(null);
  private readonly retryTick = signal(0);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly tendencia30d = computed(() => this.reporte()?.tendencia_30d ?? []);

  readonly maxCount = computed(() =>
    Math.max(1, ...this.tendencia30d().map((b) => b.count)),
  );

  // Expose Math to template
  readonly Math = Math;

  constructor() {
    this.cargar();
  }

  private buildQuery(): Record<string, any> {
    const f = this.filtros();
    const q: Record<string, any> = {};

    if (f.selects['cine']) q['id_cine'] = f.selects['cine'];
    if (f.selects['politica-cancelacion']) q['id_politica'] = f.selects['politica-cancelacion'];

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
    this.loading.set(true);
    this.cancelacionesError.set(null);
    this.reporte.set(null);
    this.reportesSvc.cancelaciones(this.buildQuery()).subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.cancelacionesError.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.retryTick.update((n) => n + 1);
    this.cargar();
  }

  onFiltrosChange(v: ReportFiltrosValue) {
    this.filtros.set(v);
    this.cargar();
  }
}
