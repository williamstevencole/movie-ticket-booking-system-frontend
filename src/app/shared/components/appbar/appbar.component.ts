import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideCreditCard,
  LucideGift,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMapPin,
  LucideShield,
  LucideUser,
} from '@lucide/angular';
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
    LucideLayoutDashboard,
    LucideUser,
    LucideCreditCard,
    LucideGift,
    LucideShield,
    LucideBell,
    BuscadorGlobalComponent,
  ],
  template: `
    <header class="appbar">
      <div class="appbar-inner">
        <a class="brand" routerLink="/"
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

          @if (isAuth()) {
            @if (isAdmin()) {
              <a class="dash-link" routerLink="/admin" title="Dashboard admin">
                <svg lucideLayoutDashboard [size]="16"></svg>
                <span>Dashboard</span>
              </a>
            }

            <div class="user-menu">
              <button
                class="avatar-btn"
                (click)="toggleMenu($event)"
                [attr.aria-expanded]="menuOpen()"
                aria-haspopup="menu"
                title="Mi cuenta"
              >
                <span class="avatar">{{ initials() }}</span>
              </button>

              @if (menuOpen()) {
                <div class="menu" role="menu">
                  <div class="menu-head">
                    <div class="menu-name">{{ userName() }}</div>
                    <div class="menu-email">{{ userEmail() }}</div>
                  </div>
                  <a routerLink="/cuenta/perfil" (click)="closeMenu()" role="menuitem">
                    <svg lucideUser [size]="16"></svg><span>Perfil</span>
                  </a>
                  <a routerLink="/cuenta/metodos-pago" (click)="closeMenu()" role="menuitem">
                    <svg lucideCreditCard [size]="16"></svg><span>Métodos de pago</span>
                  </a>
                  <a routerLink="/cuenta/cupones" (click)="closeMenu()" role="menuitem">
                    <svg lucideGift [size]="16"></svg><span>Cupones</span>
                  </a>
                  <a routerLink="/cuenta/seguridad" (click)="closeMenu()" role="menuitem">
                    <svg lucideShield [size]="16"></svg><span>Seguridad</span>
                  </a>
                  <a routerLink="/cuenta/notificaciones" (click)="closeMenu()" role="menuitem">
                    <svg lucideBell [size]="16"></svg><span>Notificaciones</span>
                  </a>
                  @if (showLogout) {
                    <button class="menu-logout" (click)="onLogout()" role="menuitem">
                      <svg lucideLogOut [size]="16"></svg><span>Cerrar sesión</span>
                    </button>
                  }
                </div>
              }
            </div>
          } @else {
            <a class="btn-ghost" routerLink="/login">Iniciar sesión</a>
            <a class="btn-primary" routerLink="/registro">Crear cuenta</a>
          }
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
  private host = inject(ElementRef<HTMLElement>);

  @Input() navItems: AppNavItem[] = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];
  @Input() showLogout = true;

  readonly loggedOut = output<void>();
  readonly menuOpen = signal(false);

  readonly cinemaName = this.locationSvc.cinemaName;
  readonly cityName = this.locationSvc.cityName;
  readonly isAuth = this.auth.isAuthenticated;
  readonly isAdmin = computed(() => {
    const r = this.auth.role();
    return r === 'admin' || r === 'taquillero';
  });

  initials(): string {
    const name = this.auth.user()?.nombre ?? '';
    return name
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  userName(): string {
    return this.auth.user()?.nombre ?? '';
  }

  userEmail(): string {
    return this.auth.user()?.email ?? '';
  }

  toggleMenu(ev: Event): void {
    ev.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (!this.menuOpen()) return;
    const target = ev.target as Node | null;
    if (target && this.host.nativeElement.contains(target)) return;
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  onLogout(): void {
    this.menuOpen.set(false);
    this.auth.logoutRemote().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.locationSvc.clear();
    this.auth.clearSession();
    this.loggedOut.emit();
    this.router.navigate(['/elegir-cine']);
  }
}
