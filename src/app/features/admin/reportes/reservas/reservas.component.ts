import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideClipboardList } from '@lucide/angular';

import {
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../../../shared/services/reservas.service';
import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../../shared/services/peliculas.service';
import { Cine, CinesService } from '../../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../../shared/components/export-button.component';
import {
  ReportFiltrosComponent,
  ReportFiltrosValue,
} from '../../../../shared/components/report-filtros.component';

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
    ExportButtonComponent,
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
            <app-export-button
              filename="reservas"
              [columns]="exportColumns"
              [rows]="filtered()"
            />
          </div>

          <section class="kpi-grid">
            <div class="kpi">
              <span class="kpi-label">Reservas</span>
              <span class="kpi-value tnum">{{ filtered().length | number }}</span>
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
                {{ filtered().length }} de {{ reservas().length }} reservas en período
              </span>
            </div>

            @if (paged().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideClipboardList [size]="22"></svg>
                </span>
                <h3>Sin reservas</h3>
                <p>Ajusta el rango de fechas o los filtros.</p>
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
                    @for (r of paged(); track r.id) {
                      <tr>
                        <td><span class="cell-strong tnum">{{ r.numero_reserva }}</span></td>
                        <td>
                          <div class="cell-strong">{{ usuarioNombre(r.id_usuario) }}</div>
                          <div class="cell-sub">{{ usuarioEmail(r.id_usuario) }}</div>
                        </td>
                        <td class="col-hide-sm">
                          <div class="cell-strong">{{ peliculaTitulo(r.id_funcion) }}</div>
                          <div class="cell-sub">{{ cineSala(r.id_funcion) }}</div>
                        </td>
                        <td class="tnum">
                          <div>{{ fechaFuncion(r.id_funcion) | date: 'd MMM' }}</div>
                          <div class="cell-sub">{{ fechaFuncion(r.id_funcion) | date: 'HH:mm' }}</div>
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
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5" class="label">Totales</td>
                      <td class="right tnum">L {{ totalsRow() | number }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
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
  styleUrl: '../reportes.shared.scss',
})
export class AdminReporteReservasComponent {
  private reservasSvc = inject(ReservasService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);

  readonly reservas = signal<Reserva[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly usuarios = signal<ReservaUsuario[]>([]);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly exportColumns: ExportColumn<Reserva>[] = [
    { key: 'numero_reserva', label: '# Reserva', value: (r) => r.numero_reserva },
    { key: 'cliente', label: 'Cliente', value: (r) => this.usuarioNombre(r.id_usuario) },
    { key: 'email', label: 'Email', value: (r) => this.usuarioEmail(r.id_usuario) },
    { key: 'pelicula', label: 'Película', value: (r) => this.peliculaTitulo(r.id_funcion) },
    { key: 'cine', label: 'Cine / sala', value: (r) => this.cineSala(r.id_funcion) },
    { key: 'fecha_funcion', label: 'Fecha función', value: (r) => this.fechaFuncion(r.id_funcion) },
    { key: 'num_asientos', label: 'Asientos', value: (r) => r.num_asientos },
    { key: 'monto_total', label: 'Total', value: (r) => r.monto_total },
    { key: 'estado', label: 'Estado', value: (r) => r.estado },
    { key: 'created_at', label: 'Creada', value: (r) => r.created_at },
  ];

  readonly funcionesById = computed(() => {
    const map = new Map<string, Funcion>();
    for (const f of this.funciones()) map.set(f.id, f);
    return map;
  });
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
  readonly usuariosById = computed(() => {
    const map = new Map<string, ReservaUsuario>();
    for (const u of this.usuarios()) map.set(u.id, u);
    return map;
  });

  readonly filtered = computed(() => {
    const f = this.filtros();
    const periodo = f.periodo;
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

    const term = (f.search || '').toLowerCase().trim();
    const cine = f.selects['cine'] ?? null;
    const ciudad = f.selects['ciudad'] ?? null;
    const pelicula = f.selects['pelicula'] ?? null;
    const estado = f.selects['estado-reserva'] ?? null;

    const cinesOfCiudad = ciudad
      ? new Set(this.cines().filter((c) => c.id_ciudad === ciudad).map((c) => c.id))
      : null;

    return this.reservas().filter((r) => {
      const ts = new Date(r.created_at).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (estado && r.estado !== estado) return false;
      if (term) {
        const u = this.usuariosById().get(r.id_usuario);
        const hit =
          r.numero_reserva.toLowerCase().includes(term) ||
          (u && u.nombre.toLowerCase().includes(term));
        if (!hit) return false;
      }
      if (cinesOfCiudad || cine || pelicula) {
        const fun = this.funcionesById().get(r.id_funcion);
        if (!fun) return false;
        if (cinesOfCiudad && !cinesOfCiudad.has(fun.id_cine)) return false;
        if (cine && fun.id_cine !== cine) return false;
        if (pelicula && fun.id_pelicula !== pelicula) return false;
      }
      return true;
    });
  });

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  readonly kpis = computed(() => {
    const rows = this.filtered();
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
    return {
      cobrado,
      reembolsado,
      neto: cobrado - reembolsado,
      pagadas,
      reembolsadas,
    };
  });

  readonly totalsRow = computed(() =>
    this.filtered().reduce((sum, r) => sum + r.monto_total, 0),
  );

  constructor() {
    this.reservasSvc.list().subscribe((d) => this.reservas.set(d));
    this.reservasSvc.listUsuarios().subscribe((d) => this.usuarios.set(d));
    this.funcionesSvc.list().subscribe((d) => this.funciones.set(d));
    this.peliculasSvc.list().subscribe((d) => this.peliculas.set(d));
    this.cinesSvc.list().subscribe((d) => this.cines.set(d.data));
    this.ciudadesSvc.list().subscribe((d) => this.ciudades.set(d));

    effect(() => {
      const total = this.filtered().length;
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > maxPage) this.page.set(maxPage);
    });
  }

  onFiltrosChange(v: ReportFiltrosValue) {
    this.filtros.set(v);
    this.page.set(1);
  }

  onPageSizeChange(s: number) { this.pageSize.set(s); this.page.set(1); }

  usuarioNombre(id: string): string {
    return this.usuariosById().get(id)?.nombre ?? '—';
  }
  usuarioEmail(id: string): string {
    return this.usuariosById().get(id)?.email ?? '';
  }
  peliculaTitulo(idFuncion: string): string {
    const f = this.funcionesById().get(idFuncion);
    return f ? this.peliculasById().get(f.id_pelicula)?.titulo ?? '—' : '—';
  }
  cineSala(idFuncion: string): string {
    const f = this.funcionesById().get(idFuncion);
    if (!f) return '—';
    const cine = this.cinesById().get(f.id_cine);
    if (!cine) return '—';
    const sala = cine.salas.find((s) => s.id === f.id_sala);
    return sala ? `${cine.nombre} · Sala ${sala.nombre}` : cine.nombre;
  }
  fechaFuncion(idFuncion: string): string {
    return this.funcionesById().get(idFuncion)?.fecha_inicio ?? '';
  }
  estadoLabel(e: Reserva['estado']): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
    }
  }
}
