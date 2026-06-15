import { Component, inject, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideLogOut, LucideMapPin } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { BuscadorGlobalComponent } from '../buscador-global/buscador-global.component';

export type AppNavItem = { label: string; route?: string; active?: boolean };

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideMapPin,
    LucideLogOut,
    BuscadorGlobalComponent,
  ],
  template: `
    <header class="appbar">
      <div class="appbar-inner">
        <a class="brand" routerLink="/cartelera"
          ><span class="mark">C</span>Cinetario</a
        >
        <nav class="appnav">
          @for (item of navItems; track item.label) {
            @if (item.route) {
              <a [routerLink]="item.route" [class.on]="item.active">{{
                item.label
              }}</a>
            } @else {
              <a [class.on]="item.active">{{ item.label }}</a>
            }
          }
        </nav>
        <div class="app-right">
          <app-buscador-global />
          <a class="citychip" routerLink="/elegir-cine" title="Cambiar cine">
            <svg lucideMapPin [size]="14"></svg>
            <span class="citychip-name">{{
              cinemaName() ?? 'Elegí un cine'
            }}</span>
            @if (cityName(); as city) {
              <span class="citychip-city">· {{ city }}</span>
            }
          </a>
          <div class="user">
            <span class="avatar">{{ initials() }}</span>
            @if (showLogout) {
              <button
                class="logout"
                (click)="onLogout()"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg lucideLogOut [size]="16"></svg>
              </button>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './appbar.component.scss',
})
export class AppbarComponent {
  private auth = inject(AuthService);
  private locationSvc = inject(LocationService);
  private router = inject(Router);

  @Input() navItems: AppNavItem[] = [
    { label: 'Cartelera', route: '/cartelera', active: true },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/cuenta/boletos' },
  ];
  @Input() showLogout = true;

  readonly loggedOut = output<void>();

  readonly cinemaName = this.locationSvc.cinemaName;
  readonly cityName = this.locationSvc.cityName;

  initials(): string {
    const name = this.auth.user()?.nombre ?? '?';
    return name
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  onLogout(): void {
    this.auth.logoutRemote().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.locationSvc.clear();
    this.auth.clearSession();
    this.loggedOut.emit();
    this.router.navigate(['/login']);
  }
}
