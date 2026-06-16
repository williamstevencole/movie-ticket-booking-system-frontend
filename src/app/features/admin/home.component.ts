import { Component, inject } from '@angular/core';
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

        <!-- KPIs -->
        <div class="stats">
          @for (s of stats; track s.label) {
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
        </div>

        <div class="dash-grid">

          <!-- LEFT COLUMN -->
          <div>
            <!-- top films -->
            <div class="panel topfilms">
              <div class="panel-head">
                <h3>Más vendidas esta semana</h3>
                <a class="link">Ver reporte completo</a>
              </div>
              @for (f of topFilms; track f.rank) {
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
export class AdminHomeComponent {
  private auth = inject(AuthService);

  readonly user = this.auth.user;

  firstName(): string {
    return this.user()?.nombre?.split(' ')[0] ?? 'admin';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  readonly stats: Stat[] = [
    { label: 'Funciones hoy', value: '14', delta: '+2 vs ayer', deltaType: 'up' },
    { label: 'Boletos vendidos', value: '487', delta: '+12.4% sem.', deltaType: 'up', accent: 'red' },
    { label: 'Ingresos del día', value: 'L 58 440', delta: '−3.1% vs ayer', deltaType: 'dn', accent: 'orange' },
    { label: 'Reembolsos pendientes', value: '3', delta: '2 efectivo · 1 tarjeta', deltaType: 'flat', accent: 'red' },
  ];

  readonly topFilms: TopFilm[] = [
    { rank: 1, title: 'El faro al sur', meta: '12 funciones · 6 días en cartelera', amount: 'L 142 800', tickets: '1 189 boletos', poster: 'p-2' },
    { rank: 2, title: 'Vientos del este', meta: '9 funciones · 14 días en cartelera', amount: 'L 98 460', tickets: '820 boletos', poster: 'p-4' },
    { rank: 3, title: 'La frontera blanca', meta: '8 funciones · 11 días en cartelera', amount: 'L 76 120', tickets: '634 boletos', poster: 'p-5' },
    { rank: 4, title: 'La hora del lobo', meta: '4 funciones · estreno hoy', amount: 'L 18 200', tickets: '152 boletos', poster: 'p-1' },
  ];

  readonly quickActions: QuickAction[] = [
    { icon: LucidePlus, label: 'Cargar nueva película' },
    { icon: LucidePlus, label: 'Programar función' },
    { icon: LucideDollarSign, label: 'Editar precios' },
    { icon: LucideFileText, label: 'Política de cancelación' },
    { icon: LucideDownload, label: 'Reportes y CSV' },
  ];
}
