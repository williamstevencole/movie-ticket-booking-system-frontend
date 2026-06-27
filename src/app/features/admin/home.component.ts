import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideDownload,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideDollarSign,
  LucideFileText,
  LucideAlertCircle,
  LucideRefreshCw,
  type LucideIconInput,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { PeriodPickerComponent, PeriodValue } from '../../shared/components/period-picker.component';
import { AdminReservasService, AdminReservaRow } from '../../shared/services/admin-reservas.service';
import { PagosService, PagoAdminRow } from '../../shared/services/pagos.service';
import { extractMessage } from '../../shared/utils/http-errors';

interface Stat {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'dn' | 'flat';
  accent?: 'red' | 'orange' | 'success';
}

interface TopFilm {
  rank: number;
  title: string;
  meta: string;
  amount: string;
  tickets: string;
}

interface QuickAction {
  icon: LucideIconInput;
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    PeriodPickerComponent,
    LucideDynamicIcon,
    LucidePlus,
    LucideDownload,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideAlertCircle,
    LucideRefreshCw,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />

      <main class="admin-main">

        @if (error()) {
          <div class="error-banner" role="alert">
            <svg lucideAlertCircle [size]="18"></svg>
            <span>{{ error() }}</span>
            <button class="btn btn-sm" (click)="reload()">
              <svg lucideRefreshCw [size]="14"></svg>
              Reintentar
            </button>
          </div>
        }

        <div class="admin-topbar">
          <div>
            <div class="breadcrumb">
              <span>Admin</span>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Dashboard</span>
            </div>
            <h1>{{ greeting() }}, {{ firstName() }}</h1>
          </div>
          <div class="actions">
            <button class="btn">
              <svg lucideDownload [size]="16"></svg>
              <span>Exportar día</span>
            </button>
            <button class="btn btn-primary">
              <svg lucidePlus [size]="16"></svg>
              <span>Nueva función</span>
            </button>
          </div>
        </div>

        <div class="period-bar">
          <app-period-picker [value]="periodo()" (valueChange)="onPeriodoChange($event)" />
        </div>

        <!-- KPIs -->
        <div class="stats">
          @if (loading()) {
            @for (i of [1,2,3,4]; track i) {
              <div class="stat skeleton-card">
                <div class="skel skel-lbl"></div>
                <div class="skel skel-v"></div>
                <div class="skel skel-delta"></div>
              </div>
            }
          } @else {
            @for (s of statsComputed(); track s.label) {
              <div class="stat">
                <div class="lbl">{{ s.label }}</div>
                <div class="v" [class.red]="s.accent === 'red'" [class.orange]="s.accent === 'orange'">{{ s.value }}</div>
                <div class="delta" [class.up]="s.deltaType === 'up'" [class.dn]="s.deltaType === 'dn'">
                  @if (s.deltaType === 'up') {
                    <svg lucideTrendingUp [size]="12"></svg>
                  } @else if (s.deltaType === 'dn') {
                    <svg lucideTrendingDown [size]="12"></svg>
                  }
                  <span>{{ s.delta }}</span>
                </div>
              </div>
            }
          }
        </div>

        <div class="dash-grid">

          <!-- LEFT COLUMN -->
          <div>
            <!-- top films -->
            <div class="panel topfilms">
              <div class="panel-head">
                <h3>Más vendidas en el período</h3>
                <a class="link">Ver reporte completo</a>
              </div>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="row skeleton-row">
                    <div class="skel skel-rank"></div>
                    <div class="skel skel-poster"></div>
                    <div>
                      <div class="skel skel-line"></div>
                      <div class="skel skel-line short"></div>
                    </div>
                    <div class="sl">
                      <div class="skel skel-line right"></div>
                      <div class="skel skel-line short right"></div>
                    </div>
                  </div>
                }
              } @else {
                @for (f of topFilmsComputed(); track f.rank) {
                  <div class="row" [class.first]="f.rank === 1" [class.second]="f.rank === 2">
                    <span class="rank">{{ f.rank }}</span>
                    <div>
                      <div class="nm">{{ f.title }}</div>
                      <div class="mt">{{ f.meta }}</div>
                    </div>
                    <div class="sl">
                      <div class="amt">{{ f.amount }}</div>
                      <div class="ct">{{ f.tickets }}</div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div>
            <div class="panel quick">
              <div class="panel-head"><h3>Atajos rápidos</h3></div>
              @for (q of quickActions; track q.label) {
                <a [routerLink]="q.routerLink">
                  <span class="ic">
                    <svg [lucideIcon]="q.icon" [size]="16"></svg>
                  </span>
                  <span>{{ q.label }}</span>
                </a>
              }
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class AdminHomeComponent implements OnInit {
  private auth = inject(AuthService);
  private reservasSvc = inject(AdminReservasService);
  private pagosSvc = inject(PagosService);

  readonly user = this.auth.user;

  periodo = signal<PeriodValue>({ preset: '30d', from: '', to: '' });
  loading = signal(true);
  error = signal<string | null>(null);
  reservas = signal<AdminReservaRow[]>([]);
  pagos = signal<PagoAdminRow[]>([]);

  private pendingCalls = 0;

  ngOnInit() {
    this.loadAll();
  }

  private loadAll() {
    this.loading.set(true);
    this.error.set(null);
    this.pendingCalls = 2;

    const done = () => {
      this.pendingCalls--;
      if (this.pendingCalls <= 0) this.loading.set(false);
    };
    const fail = (err: unknown) => {
      this.error.set(extractMessage(err));
      done();
    };

    this.reservasSvc.list({ limit: 100 }).subscribe({
      next: (res) => { this.reservas.set(res.data); done(); },
      error: fail,
    });
    this.pagosSvc.list({ limit: 100 }).subscribe({
      next: (res) => { this.pagos.set(res.data); done(); },
      error: fail,
    });
  }

  reload() {
    this.loadAll();
  }

  onPeriodoChange(p: PeriodValue) {
    this.periodo.set(p);
  }

  firstName(): string {
    return this.user()?.nombre?.split(' ')[0] ?? 'admin';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  private rangeDates() {
    const p = this.periodo();
    return {
      from: p.from ? new Date(p.from) : null,
      to: p.to ? new Date(p.to + 'T23:59:59') : null,
    };
  }

  private inRange(iso: string, from: Date | null, to: Date | null) {
    const d = new Date(iso);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  private fmtQ(n: number): string {
    return 'L ' + n.toLocaleString('es-HN', { maximumFractionDigits: 0 });
  }

  statsComputed = computed<Stat[]>(() => {
    const { from, to } = this.rangeDates();
    const reservasInRange = this.reservas().filter((r) => this.inRange(r.created_at, from, to));
    const pagosInRange = this.pagos().filter((p) => this.inRange(p.created_at, from, to));

    const cobrado = pagosInRange
      .filter((p) => p.estado === 'exitoso')
      .reduce((sum, p) => sum + p.monto_final, 0);
    const reembolsado = pagosInRange
      .filter((p) => p.estado === 'reembolsado')
      .reduce((sum, p) => sum + p.monto_final, 0);
    const neto = cobrado - reembolsado;

    return [
      {
        label: 'Reservas',
        value: reservasInRange.length.toLocaleString('es-HN'),
        delta: '—',
        deltaType: 'flat',
      },
      {
        label: 'Cobrado',
        value: this.fmtQ(cobrado),
        delta: '—',
        deltaType: 'flat',
        accent: 'success',
      },
      {
        label: 'Reembolsado',
        value: this.fmtQ(reembolsado),
        delta: '—',
        deltaType: 'flat',
        accent: 'orange',
      },
      {
        label: 'Neto',
        value: this.fmtQ(neto),
        delta: '—',
        deltaType: 'flat',
        accent: neto < 0 ? 'red' : undefined,
      },
    ];
  });

  topFilmsComputed = computed<TopFilm[]>(() => {
    const { from, to } = this.rangeDates();
    const reservasInRange = this.reservas().filter((r) => this.inRange(r.created_at, from, to));
    // Cross-join pagos by reserva id for monto lookup
    const pagosByReserva = new Map(this.pagos().map((p) => [p.id_reserva, p]));

    // Aggregate by pelicula id using the embedded pelicula object on each AdminReservaRow.
    // This avoids a separate FuncionesService + PeliculasService HTTP call.
    const agg = new Map<string, { titulo: string; reservas: number; tickets: number; monto: number }>();
    for (const r of reservasInRange) {
      const pid = r.pelicula?.id;
      if (!pid) continue;  // skip if backend didn't embed pelicula
      const pago = pagosByReserva.get(r.id);
      const monto = pago && pago.estado === 'exitoso' ? pago.monto_final : 0;
      const cur = agg.get(pid) ?? { titulo: r.pelicula!.titulo, reservas: 0, tickets: 0, monto: 0 };
      cur.reservas += 1;
      cur.tickets += r.num_asientos;
      cur.monto += monto;
      agg.set(pid, cur);
    }

    const ranked = Array.from(agg.entries())
      .map(([pid, v]) => ({ pid, ...v }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);

    return ranked.map((row, idx) => ({
      rank: idx + 1,
      title: row.titulo ?? '—',
      meta: `${row.reservas} reservas`,
      amount: this.fmtQ(row.monto),
      tickets: `${row.tickets} boletos`,
    }));
  });

  readonly quickActions: QuickAction[] = [
    { icon: LucidePlus, label: 'Cargar nueva película', routerLink: '/admin/peliculas/crear' },
    { icon: LucidePlus, label: 'Programar función', routerLink: '/admin/funciones/crear' },
    { icon: LucideDollarSign, label: 'Editar precios', routerLink: '/admin/precios' },
    { icon: LucideFileText, label: 'Política de cancelación', routerLink: '/admin/politicas' },
    { icon: LucideDownload, label: 'Reportes y CSV', routerLink: '/admin/reportes' },
  ];
}
