import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Reembolso,
  ReembolsosService,
} from '../../../../shared/services/reembolsos.service';
import {
  PoliticaCancelacion,
  PoliticasCancelacionService,
} from '../../../../shared/services/politicas-cancelacion.service';
import {
  Reserva,
  ReservasService,
} from '../../../../shared/services/reservas.service';
import { Cine, CinesService } from '../../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../../shared/components/export-button.component';
import {
  ReportFiltrosComponent,
  ReportFiltrosValue,
} from '../../../../shared/components/report-filtros.component';

type DistribucionRow = {
  id_politica: string | null;
  politicaNombre: string;
  cineNombre: string;
  count: number;
  pctPromedio: number;
  reembolsado: number;
  retenido: number;
};

@Component({
  selector: 'app-admin-reporte-estadisticas-cancelacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DecimalPipe,
    AdminSidebarComponent,
    ExportButtonComponent,
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
            <app-export-button
              filename="estadisticas-cancelacion"
              [columns]="exportColumns"
              [rows]="reembolsosFiltrados()"
            />
          </div>

          <app-report-filtros
            [config]="{ periodo: true, selects: ['cine', 'politica-cancelacion'] }"
            [value]="filtros()"
            (valueChange)="onFiltrosChange($event)"
          />

          @if (kpis().cancelaciones === 0) {
            <div class="empty-state">
              <p>Sin cancelaciones en este período.</p>
              <p class="muted">Ajustá los filtros para ver datos.</p>
            </div>
          } @else {
            <section class="kpi-grid">
              <div class="kpi">
                <span class="kpi-label">Cancelaciones</span>
                <span class="kpi-value tnum">{{ kpis().cancelaciones | number }}</span>
                <span class="kpi-sub">reservas afectadas</span>
              </div>
              <div class="kpi">
                <span class="kpi-label">% del total</span>
                <span class="kpi-value tnum">{{ kpis().pctDelTotal | number: '1.1-1' }}%</span>
                <span class="kpi-sub">vs reservas creadas</span>
              </div>
              <div class="kpi refund">
                <span class="kpi-label">Reembolsado</span>
                <span class="kpi-value tnum">Q{{ kpis().reembolsado | number }}</span>
                <span class="kpi-sub">total devuelto a clientes</span>
              </div>
              <div class="kpi neto">
                <span class="kpi-label">Retenido</span>
                <span class="kpi-value tnum">Q{{ kpis().retenido | number }}</span>
                <span class="kpi-sub">lo que se queda el cine</span>
              </div>
            </section>

            <section class="panel">
              <div class="panel-head">
                <span class="panel-title">Distribución por política</span>
                <span class="panel-sub muted">Agrupado por política aplicada al reembolso</span>
              </div>

              @if (distribucion().length === 0) {
                <div class="empty">Sin datos en este período.</div>
              } @else {
                <div class="table-scroll">
                  <table class="tbl dense">
                    <thead>
                      <tr>
                        <th>Política</th>
                        <th>Cine</th>
                        <th class="right"># cancelaciones</th>
                        <th class="right">% aplicado promedio</th>
                        <th class="right">Reembolsado</th>
                        <th class="right">Retenido</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of distribucion(); track row.id_politica) {
                        <tr>
                          <td><span class="cell-strong">{{ row.politicaNombre }}</span></td>
                          <td>{{ row.cineNombre }}</td>
                          <td class="right tnum">{{ row.count | number }}</td>
                          <td class="right tnum">{{ row.pctPromedio | number: '1.1-1' }}%</td>
                          <td class="right tnum">Q{{ row.reembolsado | number }}</td>
                          <td class="right tnum">Q{{ row.retenido | number }}</td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td></td>
                        <td class="label">Total</td>
                        <td class="right tnum">{{ totalesDistribucion().count | number }}</td>
                        <td class="right">—</td>
                        <td class="right tnum">Q{{ totalesDistribucion().reembolsado | number }}</td>
                        <td class="right tnum">Q{{ totalesDistribucion().retenido | number }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              }
            </section>

            <section class="panel">
              <div class="panel-head">
                <span class="panel-title">Tendencia últimos 6 meses</span>
                <span class="panel-sub muted">Independiente del filtro de período</span>
              </div>

              <svg class="trend-chart" viewBox="0 0 600 220" role="img" aria-label="Cancelaciones por mes">
                @for (b of tendencia6Meses(); track b.ym; let i = $index) {
                  <g [attr.transform]="'translate(' + (i * 90) + ', 0)'">
                    <rect [attr.x]="10"
                          [attr.y]="180 - (b.count / maxCount() * 150)"
                          width="60"
                          [attr.height]="b.count / maxCount() * 150"
                          rx="3" class="bar">
                      <title>{{ b.label }} — {{ b.count }} cancelaciones, Q{{ b.monto | number }}</title>
                    </rect>
                    <text x="40" y="200" text-anchor="middle" class="bar-label">{{ b.label }}</text>
                    <text x="40" [attr.y]="170 - (b.count / maxCount() * 150)"
                          text-anchor="middle" class="bar-count">{{ b.count }}</text>
                  </g>
                }
              </svg>
            </section>
          }
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../reportes.shared.scss', './estadisticas-cancelacion.component.scss'],
})
export class AdminReporteEstadisticasCancelacionComponent {
  private reembolsosSvc = inject(ReembolsosService);
  private politicasSvc = inject(PoliticasCancelacionService);
  private reservasSvc = inject(ReservasService);
  private cinesSvc = inject(CinesService);

  readonly reembolsos = signal<Reembolso[]>([]);
  readonly politicas = signal<PoliticaCancelacion[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly cines = signal<Cine[]>([]);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly exportColumns: ExportColumn<Reembolso>[] = [
    { key: 'id', label: 'ID', value: (r) => r.id },
    { key: 'id_politica', label: 'Política', value: (r) => this.politicaNombre(r.id_politica) },
    { key: 'porcentaje_aplicado', label: '% aplicado', value: (r) => r.porcentaje_aplicado },
    { key: 'monto', label: 'Monto', value: (r) => r.monto },
    { key: 'estado', label: 'Estado', value: (r) => r.estado },
    { key: 'created_at', label: 'Fecha', value: (r) => r.created_at },
  ];

  readonly politicasById = computed(() => {
    const map = new Map<string, PoliticaCancelacion>();
    for (const p of this.politicas()) map.set(p.id, p);
    return map;
  });

  readonly cinesById = computed(() => {
    const map = new Map<string, Cine>();
    for (const c of this.cines()) map.set(c.id, c);
    return map;
  });

  private range = computed(() => {
    const periodo = this.filtros().periodo;
    let fromTs = -Infinity;
    let toTs = Infinity;
    if (periodo) {
      const now = Date.now();
      switch (periodo.preset) {
        case '7d':
          fromTs = now - 7 * 86_400_000;
          toTs = now;
          break;
        case '30d':
          fromTs = now - 30 * 86_400_000;
          toTs = now;
          break;
        case 'mes': {
          const d = new Date();
          fromTs = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
          toTs = now;
          break;
        }
        case 'custom':
          fromTs = periodo.from ? new Date(periodo.from).getTime() : -Infinity;
          toTs = periodo.to ? new Date(periodo.to + 'T23:59:59').getTime() : Infinity;
          break;
      }
    }
    return { fromTs, toTs };
  });

  private inRange(iso: string): boolean {
    const ts = new Date(iso).getTime();
    const { fromTs, toTs } = this.range();
    return ts >= fromTs && ts <= toTs;
  }

  readonly reembolsosFiltrados = computed(() => {
    const cineSel = this.filtros().selects['cine'] ?? null;
    const politicaSel = this.filtros().selects['politica-cancelacion'] ?? null;
    return this.reembolsos().filter((r) => {
      if (!this.inRange(r.created_at)) return false;
      if (politicaSel && r.id_politica !== politicaSel) return false;
      if (cineSel) {
        if (!r.id_politica) return false;
        const pol = this.politicasById().get(r.id_politica);
        if (!pol || pol.id_cine !== cineSel) return false;
      }
      return true;
    });
  });

  readonly kpis = computed(() => {
    const rows = this.reembolsosFiltrados();
    let reembolsado = 0;
    let retenido = 0;
    for (const r of rows) {
      reembolsado += Number(r.monto);
      if (r.porcentaje_aplicado > 0) {
        const original = r.monto / (r.porcentaje_aplicado / 100);
        retenido += original - r.monto;
      }
    }
    const cancelaciones = rows.length;
    const reservasPeriodo = this.reservas().filter((rs) =>
      this.inRange(rs.created_at),
    ).length;
    const pctDelTotal =
      reservasPeriodo > 0 ? (cancelaciones / reservasPeriodo) * 100 : 0;
    return { cancelaciones, pctDelTotal, reembolsado, retenido };
  });

  readonly distribucion = computed<DistribucionRow[]>(() => {
    const groups = new Map<string, {
      id_politica: string | null;
      count: number;
      pctSum: number;
      reembolsado: number;
      retenido: number;
    }>();
    for (const r of this.reembolsosFiltrados()) {
      const key = r.id_politica ?? '__sin__';
      let g = groups.get(key);
      if (!g) {
        g = {
          id_politica: r.id_politica,
          count: 0,
          pctSum: 0,
          reembolsado: 0,
          retenido: 0,
        };
        groups.set(key, g);
      }
      g.count++;
      g.pctSum += r.porcentaje_aplicado;
      g.reembolsado += Number(r.monto);
      if (r.porcentaje_aplicado > 0) {
        g.retenido += r.monto / (r.porcentaje_aplicado / 100) - r.monto;
      }
    }

    const out: DistribucionRow[] = [];
    for (const g of groups.values()) {
      const pol = g.id_politica ? this.politicasById().get(g.id_politica) : null;
      const cine = pol ? this.cinesById().get(pol.id_cine) : null;
      out.push({
        id_politica: g.id_politica,
        politicaNombre: pol?.nombre ?? 'Sin política',
        cineNombre: cine?.nombre ?? '—',
        count: g.count,
        pctPromedio: g.count > 0 ? g.pctSum / g.count : 0,
        reembolsado: g.reembolsado,
        retenido: g.retenido,
      });
    }
    out.sort((a, b) => b.count - a.count);
    return out;
  });

  readonly totalesDistribucion = computed(() => {
    let count = 0;
    let reembolsado = 0;
    let retenido = 0;
    for (const row of this.distribucion()) {
      count += row.count;
      reembolsado += row.reembolsado;
      retenido += row.retenido;
    }
    return { count, reembolsado, retenido };
  });

  readonly tendencia6Meses = computed(() => {
    const hoy = new Date();
    const buckets: { label: string; ym: string; count: number; monto: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' });
      buckets.push({ label, ym, count: 0, monto: 0 });
    }
    for (const r of this.reembolsos()) {
      const d = new Date(r.created_at);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = buckets.find((x) => x.ym === ym);
      if (!b) continue;
      b.count++;
      b.monto += Number(r.monto);
    }
    return buckets;
  });

  readonly maxCount = computed(() =>
    Math.max(1, ...this.tendencia6Meses().map((b) => b.count)),
  );

  constructor() {
    this.reembolsosSvc.list().subscribe((d) => this.reembolsos.set(d));
    this.politicasSvc.list().subscribe((d) => this.politicas.set(d));
    this.reservasSvc.list().subscribe((d) => this.reservas.set(d));
    this.cinesSvc.list().subscribe((d) => this.cines.set(d.data));
  }

  onFiltrosChange(v: ReportFiltrosValue) {
    this.filtros.set(v);
  }

  politicaNombre(id: string | null): string {
    if (!id) return 'Sin política';
    return this.politicasById().get(id)?.nombre ?? id;
  }
}
