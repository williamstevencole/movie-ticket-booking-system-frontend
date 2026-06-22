import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideDownload,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideDollarSign,
  LucideFileText,
  type LucideIconInput,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { PeriodPickerComponent, PeriodValue } from '../../shared/components/period-picker.component';
import { ReservasService, Reserva } from '../../shared/services/reservas.service';
import { PagosService, Pago } from '../../shared/services/pagos.service';
import { FuncionesService, Funcion } from '../../shared/services/funciones.service';
import { PeliculasService, Pelicula } from '../../shared/services/peliculas.service';

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
  poster: string;
}

interface QuickAction {
  icon: LucideIconInput;
  label: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebarComponent,
    PeriodPickerComponent,
    LucideDynamicIcon,
    LucidePlus,
    LucideDownload,
    LucideTrendingUp,
    LucideTrendingDown,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />

      <main class="admin-main">
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
                    <div class="mp" [class]="f.poster"></div>
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
                <a>
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
  private reservasSvc = inject(ReservasService);
  private pagosSvc = inject(PagosService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);

  readonly user = this.auth.user;

  periodo = signal<PeriodValue>({ preset: '30d', from: '', to: '' });
  loading = signal(true);
  reservas = signal<Reserva[]>([]);
  pagos = signal<Pago[]>([]);
  funciones = signal<Funcion[]>([]);
  peliculas = signal<Pelicula[]>([]);

  ngOnInit() {
    this.reservasSvc.list().subscribe((rs) => this.reservas.set(rs));
    this.pagosSvc.list().subscribe((ps) => this.pagos.set(ps));
    this.funcionesSvc.list().subscribe((fs) => this.funciones.set(fs));
    this.peliculasSvc.list().subscribe((ps) => this.peliculas.set(ps));
    setTimeout(() => this.loading.set(false), 300);
  }

  onPeriodoChange(p: PeriodValue) {
    this.periodo.set(p);
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 200);
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
    const funcionesMap = new Map(this.funciones().map((f) => [f.id, f]));
    const peliculasMap = new Map(this.peliculas().map((p) => [p.id, p]));
    const pagosByReserva = new Map(this.pagos().map((p) => [p.id_reserva, p]));

    // aggregate by pelicula
    const agg = new Map<string, { reservas: number; tickets: number; monto: number }>();
    for (const r of reservasInRange) {
      const fn = funcionesMap.get(r.id_funcion);
      if (!fn) continue;
      const pid = fn.id_pelicula;
      const pago = pagosByReserva.get(r.id);
      const monto = pago && pago.estado === 'exitoso' ? pago.monto_final : 0;
      const cur = agg.get(pid) ?? { reservas: 0, tickets: 0, monto: 0 };
      cur.reservas += 1;
      cur.tickets += r.num_asientos;
      cur.monto += monto;
      agg.set(pid, cur);
    }

    const ranked = Array.from(agg.entries())
      .map(([pid, v]) => ({ pid, ...v }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);

    const posters = ['p-2', 'p-4', 'p-5', 'p-1', 'p-3', 'p-6'];

    return ranked.map((row, idx) => {
      const peli = peliculasMap.get(row.pid);
      return {
        rank: idx + 1,
        title: peli?.titulo ?? '—',
        meta: `${row.reservas} reservas`,
        amount: this.fmtQ(row.monto),
        tickets: `${row.tickets} boletos`,
        poster: posters[idx % posters.length],
      };
    });
  });

  readonly quickActions: QuickAction[] = [
    { icon: LucidePlus, label: 'Cargar nueva película' },
    { icon: LucidePlus, label: 'Programar función' },
    { icon: LucideDollarSign, label: 'Editar precios' },
    { icon: LucideFileText, label: 'Política de cancelación' },
    { icon: LucideDownload, label: 'Reportes y CSV' },
  ];
}
