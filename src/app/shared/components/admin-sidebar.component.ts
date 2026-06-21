import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideMapPin,
  LucideLayoutDashboard,
  LucideClapperboard,
  LucideFilm,
  LucideTags,
  LucideLanguages,
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
  LucideUserRound,
  LucideNotebookText,
  LucideLogOut,
  type LucideIconInput,
} from '@lucide/angular';
import { AuthService } from '../services/auth.service';

interface SideLink {
  label: string;
  icon: LucideIconInput;
  count?: number;
  urgent?: boolean;
  routerLink?: string;
  exact?: boolean;
}

interface SideSection {
  title: string;
  links: SideLink[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    LucideLogOut,
  ],
  template: `
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
            @if (link.routerLink) {
              <a
                class="side-link"
                [class.urgent]="link.urgent"
                [routerLink]="link.routerLink"
                routerLinkActive="on"
                [routerLinkActiveOptions]="{ exact: !!link.exact }"
              >
                <span class="side-link-l">
                  <svg [lucideIcon]="link.icon" [size]="18"></svg>
                  <span>{{ link.label }}</span>
                </span>
                @if (link.count !== undefined) {
                  <span class="count">{{ link.count }}</span>
                }
              </a>
            } @else {
              <a class="side-link disabled" [class.urgent]="link.urgent">
                <span class="side-link-l">
                  <svg [lucideIcon]="link.icon" [size]="18"></svg>
                  <span>{{ link.label }}</span>
                </span>
                @if (link.count !== undefined) {
                  <span class="count">{{ link.count }}</span>
                }
              </a>
            }
          }
        </div>
      }

      <div class="user-row">
        <span class="avatar">{{ initials() }}</span>
        <div>
          <div class="nm">{{ user()?.nombre }}</div>
          <div class="role">{{ (role() ?? '').toUpperCase() }}</div>
        </div>
        <button
          class="logout"
          (click)="logout()"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <svg lucideLogOut [size]="16"></svg>
        </button>
      </div>
    </aside>
  `,
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly role = this.auth.role;

  initials(): string {
    const name = this.user()?.nombre ?? '?';
    return name
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
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

  readonly sidebar: SideSection[] = [
    {
      title: 'Programación',
      links: [
        {
          label: 'Dashboard',
          icon: LucideLayoutDashboard,
          routerLink: '/admin',
          exact: true,
        },
        {
          label: 'Funciones',
          icon: LucideClapperboard,
          routerLink: '/admin/funciones',
        },
        {
          label: 'Películas',
          icon: LucideFilm,
          routerLink: '/admin/peliculas',
        },
        { label: 'Géneros', icon: LucideTags, routerLink: '/admin/generos' },
        { label: 'Idiomas', icon: LucideLanguages, routerLink: '/admin/idiomas' },
      ],
    },
    {
      title: 'Infraestructura',
      links: [
        {
          label: 'Ciudades',
          icon: LucideMapPin,
          routerLink: '/admin/ciudades',
        },
        {
          label: 'Cines',
          icon: LucideBuilding2,
          routerLink: '/admin/cines',
        },
        { label: 'Salas', icon: LucideArmchair, routerLink: '/admin/salas' },
        {
          label: 'Tipos de asiento',
          icon: LucideSofa,
          routerLink: '/admin/tipos-asiento',
        },
        {
          label: 'Precios por cine',
          icon: LucideBanknote,
          routerLink: '/admin/precios',
        },
      ],
    },
    {
      title: 'Comercial',
      links: [
        {
          label: 'Reservas',
          icon: LucideTicket,
          count: 487,
          routerLink: '/admin/reservas',
        },
        {
          label: 'Pagos',
          icon: LucideCreditCard,
          routerLink: '/admin/pagos',
        },
        {
          label: 'Cupones',
          icon: LucideGift,
          count: 6,
          routerLink: '/admin/cupones',
        },
        {
          label: 'Políticas cancelación',
          icon: LucideClipboardList,
          routerLink: '/admin/politicas',
        },
        {
          label: 'Reembolsos',
          icon: LucideUndo2,
          count: 3,
          urgent: true,
          routerLink: '/admin/reembolsos',
        },
      ],
    },
    {
      title: 'Reportes',
      links: [
        {
          label: 'Reporte de reservas',
          icon: LucideChartColumn,
          routerLink: '/admin/reportes/reservas',
        },
        {
          label: 'Estadísticas de cancelación',
          icon: LucideChartColumn,
          routerLink: '/admin/reportes/estadisticas-cancelacion',
        },
      ],
    },
    {
      title: 'Sistema',
      links: [
        { label: 'Clientes', icon: LucideUserRound, routerLink: '/admin/clientes' },
        { label: 'Usuarios & roles', icon: LucideUsers },
        { label: 'Bitácora', icon: LucideNotebookText, routerLink: '/admin/bitacora' },
      ],
    },
  ];
}
