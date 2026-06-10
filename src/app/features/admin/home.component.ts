import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  // sidebar
  LucideLayoutDashboard,
  LucideClapperboard,
  LucideFilm,
  LucideTags,
  LucideBuilding2,
  LucideArmchair,
  LucideSofa,
  LucideBanknote,
  LucideTicket,
  LucideCreditCard,
  LucideGift,
  LucideClipboardList,
  LucideUndo2,
  LucideChartColumn,
  LucideUsers,
  LucideNotebookText,
  // topbar / actions / user-row
  LucidePlus,
  LucideDownload,
  LucideLogOut,
  // stat deltas
  LucideTrendingUp,
  LucideTrendingDown,
  // quick actions
  LucideDollarSign,
  LucideFileText,
  type LucideIconInput,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';

interface SideLink {
  label: string;
  icon: LucideIconInput;
  count?: number;
  on?: boolean;
  urgent?: boolean;
}

interface SideSection {
  title: string;
  links: SideLink[];
}

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
    LucideDynamicIcon,
    LucidePlus,
    LucideDownload,
    LucideLogOut,
    LucideTrendingUp,
    LucideTrendingDown,
  ],
  template: `
    <div class="admin-body">
      <!-- SIDEBAR -->
      <aside class="admin-side">
        <div class="brand-row">
          <span class="mark">C</span>
          <div>
            <div class="nm">Cinetario</div>
            <div class="sub">OPERADORES</div>
          </div>
        </div>

        @for (sec of sidebar; track sec.title) {
          <div class="side-section">
            <div class="h">{{ sec.title }}</div>
            @for (link of sec.links; track link.label) {
              <a class="side-link" [class.on]="link.on" [class.urgent]="link.urgent">
                <span class="side-link-l">
                  <svg [lucideIcon]="link.icon" [size]="18"></svg>
                  <span>{{ link.label }}</span>
                </span>
                @if (link.count !== undefined) {
                  <span class="count">{{ link.count }}</span>
                }
              </a>
            }
          </div>
        }

        <div class="user-row">
          <span class="avatar">{{ initials() }}</span>
          <div>
            <div class="nm">{{ user()?.nombre }}</div>
            <div class="role">{{ (role() ?? '').toUpperCase() }}</div>
          </div>
          <button class="logout" (click)="logout()" title="Cerrar sesión" aria-label="Cerrar sesión">
            <svg lucideLogOut [size]="16"></svg>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="admin-main">
        <div class="admin-topbar">
          <div>
            <div class="breadcrumb">Inicio · Dashboard</div>
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
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly role = this.auth.role;

  firstName(): string {
    return this.user()?.nombre?.split(' ')[0] ?? 'admin';
  }

  initials(): string {
    const name = this.user()?.nombre ?? '?';
    return name
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  logout() {
    this.auth.logoutRemote().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout() {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }

  // ─── sidebar (data-driven con iconos Lucide)
  readonly sidebar: SideSection[] = [
    {
      title: 'Programación',
      links: [
        { label: 'Dashboard', icon: LucideLayoutDashboard, on: true },
        { label: 'Funciones', icon: LucideClapperboard, count: 14 },
        { label: 'Películas', icon: LucideFilm, count: 28 },
        { label: 'Géneros & idiomas', icon: LucideTags },
      ],
    },
    {
      title: 'Infraestructura',
      links: [
        { label: 'Cines', icon: LucideBuilding2, count: 2 },
        { label: 'Salas', icon: LucideArmchair, count: 11 },
        { label: 'Tipos de asiento', icon: LucideSofa },
        { label: 'Precios por cine', icon: LucideBanknote },
      ],
    },
    {
      title: 'Comercial',
      links: [
        { label: 'Reservas', icon: LucideTicket, count: 487 },
        { label: 'Pagos', icon: LucideCreditCard },
        { label: 'Cupones', icon: LucideGift, count: 6 },
        { label: 'Políticas cancelación', icon: LucideClipboardList },
        { label: 'Reembolsos', icon: LucideUndo2, count: 3, urgent: true },
      ],
    },
    {
      title: 'Sistema',
      links: [
        { label: 'Reportes', icon: LucideChartColumn },
        { label: 'Usuarios & roles', icon: LucideUsers },
        { label: 'Bitácora', icon: LucideNotebookText },
      ],
    },
  ];

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
