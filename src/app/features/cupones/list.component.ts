import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideMapPin,
  LucideLogOut,
  LucideSearch,
  LucideCopy,
  LucideCheck,
  LucideTicket,
  LucideClock,
  LucideAlertCircle,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import { Cupon, CuponesService } from '../../shared/services/cupones.service';
import { LocationService } from '../../shared/services/location.service';

interface CuponView extends Cupon {
  diasRestantes: number;
  vencido: boolean;
  agotado: boolean;
  porcentaje: boolean;
  copiado: boolean;
}

@Component({
  selector: 'app-cupones-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideMapPin,
    LucideLogOut,
    LucideSearch,
    LucideCopy,
    LucideCheck,
    LucideTicket,
    LucideClock,
    LucideAlertCircle,
  ],
  template: `
    <!-- HEADER -->
    <header class="appbar">
      <div class="appbar-inner">
        <a class="brand" routerLink="/cartelera"><span class="mark">C</span>Cinetario</a>
        <nav class="appnav">
          <a routerLink="/cartelera">Cartelera</a>
          <a>Próximos estrenos</a>
          <a routerLink="/cupones" class="on">Cupones</a>
          <a>Cines</a>
          <a>Mis boletos</a>
        </nav>
        <div class="app-right">
          <button class="search-mini" aria-label="Buscar">
            <svg lucideSearch [size]="16"></svg>
            <span>Buscar</span>
          </button>
          <a class="citychip" routerLink="/elegir-cine" title="Cambiar cine">
            <svg lucideMapPin [size]="14"></svg>
            <span class="citychip-name">{{ cinemaName() ?? 'Elegí un cine' }}</span>
            @if (cityName(); as city) {
              <span class="citychip-city">· {{ city }}</span>
            }
          </a>
          <div class="user">
            <span class="avatar">{{ initials() }}</span>
            <button class="logout" (click)="logout()" title="Cerrar sesión" aria-label="Cerrar sesión">
              <svg lucideLogOut [size]="16"></svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO de la página -->
    <section class="page-hero">
      <div class="wrap">
        <div class="page-hero-grid">
          <div>
            <div class="kicker">
              <svg lucideTicket [size]="14"></svg>
              <span>{{ activos().length }} cupones disponibles</span>
            </div>
            <h1>Cupones de descuento</h1>
            <p>Copiá el código y aplicalo al momento de pagar tus boletos. Los descuentos son acumulables sólo con las promociones del cine, no entre cupones.</p>
          </div>
          <div class="legend">
            <div class="lg-item">
              <span class="lg-sw porcentaje">%</span>
              <span>Descuento porcentual</span>
            </div>
            <div class="lg-item">
              <span class="lg-sw monto">L</span>
              <span>Descuento de monto fijo</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BODY -->
    <main class="wrap content">

      @if (loading()) {
        <div class="state-card">
          <div class="state-spinner"></div>
          <p>Cargando cupones…</p>
        </div>
      } @else if (errorMsg()) {
        <div class="state-card error">
          <svg lucideAlertCircle [size]="32"></svg>
          <h3>No pudimos cargar los cupones</h3>
          <p>{{ errorMsg() }}</p>
          <button class="btn btn-primary" (click)="load()">Reintentar</button>
        </div>
      } @else {

        <!-- ACTIVOS -->
        @if (activos().length > 0) {
          <section class="section">
            <div class="section-head">
              <h2>Disponibles</h2>
              <span class="count">{{ activos().length }} {{ activos().length === 1 ? 'cupón' : 'cupones' }}</span>
            </div>
            <div class="cupones-grid">
              @for (c of activos(); track c.id) {
                <article class="cupon" [class.warn]="c.diasRestantes <= 7">
                  <div class="cupon-main">
                    <div class="cupon-value">
                      @if (c.porcentaje) {
                        <span class="num">{{ c.valor }}</span><span class="sym">%</span>
                      } @else {
                        <span class="sym pre">L</span><span class="num">{{ c.valor }}</span>
                      }
                    </div>
                    <div class="cupon-meta">
                      <div class="cupon-tag">{{ c.porcentaje ? 'Descuento' : 'Monto fijo' }}</div>
                      <h3>{{ tituloCupon(c) }}</h3>
                      <div class="exp">
                        <svg lucideClock [size]="13"></svg>
                        @if (c.diasRestantes === 0) {
                          <span class="warn-text">Vence hoy</span>
                        } @else if (c.diasRestantes === 1) {
                          <span class="warn-text">Vence mañana</span>
                        } @else if (c.diasRestantes <= 7) {
                          <span class="warn-text">Vence en {{ c.diasRestantes }} días</span>
                        } @else {
                          <span>Vence en {{ c.diasRestantes }} días · {{ formatFecha(c.fecha_expiracion) }}</span>
                        }
                      </div>
                      @if (c.usos_maximos !== null) {
                        <div class="usage">
                          <div class="usage-bar">
                            <div class="usage-fill" [style.width.%]="(c.usos_actuales / c.usos_maximos) * 100"></div>
                          </div>
                          <span class="usage-text">{{ c.usos_actuales }} / {{ c.usos_maximos }} usados</span>
                        </div>
                      }
                    </div>
                  </div>
                  <div class="cupon-stub">
                    <div class="stub-code">{{ c.codigo }}</div>
                    <button class="stub-copy" (click)="copy(c)" [class.copied]="c.copiado">
                      @if (c.copiado) {
                        <svg lucideCheck [size]="14"></svg>
                        <span>Copiado</span>
                      } @else {
                        <svg lucideCopy [size]="14"></svg>
                        <span>Copiar código</span>
                      }
                    </button>
                  </div>
                </article>
              }
            </div>
          </section>
        } @else {
          <div class="state-card">
            <svg lucideTicket [size]="32"></svg>
            <h3>No hay cupones activos en este momento</h3>
            <p>Volvé pronto — los cupones se renuevan cada semana.</p>
          </div>
        }

        <!-- INACTIVOS / VENCIDOS -->
        @if (inactivos().length > 0) {
          <section class="section">
            <div class="section-head">
              <h2>Vencidos o agotados</h2>
              <span class="count">{{ inactivos().length }}</span>
            </div>
            <div class="cupones-grid">
              @for (c of inactivos(); track c.id) {
                <article class="cupon expired">
                  <div class="cupon-main">
                    <div class="cupon-value">
                      @if (c.porcentaje) {
                        <span class="num">{{ c.valor }}</span><span class="sym">%</span>
                      } @else {
                        <span class="sym pre">L</span><span class="num">{{ c.valor }}</span>
                      }
                    </div>
                    <div class="cupon-meta">
                      <div class="cupon-tag">{{ c.vencido ? 'Vencido' : 'Agotado' }}</div>
                      <h3>{{ tituloCupon(c) }}</h3>
                      <div class="exp">
                        <svg lucideClock [size]="13"></svg>
                        <span>{{ c.vencido ? 'Venció el ' + formatFecha(c.fecha_expiracion) : 'Sin usos disponibles' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="cupon-stub muted">
                    <div class="stub-code">{{ c.codigo }}</div>
                    <div class="stub-status">{{ c.vencido ? 'EXPIRADO' : 'AGOTADO' }}</div>
                  </div>
                </article>
              }
            </div>
          </section>
        }
      }

    </main>

    <footer class="appfoot">
      <div class="wrap">
        © 2026 Cinetario · sesión como <strong>{{ user()?.email }}</strong>
      </div>
    </footer>
  `,
  styleUrl: './list.component.scss',
})
export class CuponesListComponent implements OnInit {
  private cuponesSvc = inject(CuponesService);
  private auth = inject(AuthService);
  private locationSvc = inject(LocationService);
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly cinemaName = this.locationSvc.cinemaName;
  readonly cityName = this.locationSvc.cityName;

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly cupones = signal<CuponView[]>([]);

  readonly activos = computed(() =>
    this.cupones().filter((c) => !c.vencido && !c.agotado && c.activo),
  );
  readonly inactivos = computed(() =>
    this.cupones().filter((c) => c.vencido || c.agotado || !c.activo),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.cuponesSvc.list().subscribe({
      next: (data) => {
        this.cupones.set(data.map((c) => this.decorate(c)));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.errorMsg.set('No pudimos conectar con el servidor. ¿Está arriba la API?');
        } else {
          const apiMsg = (err.error as { message?: string | string[] })?.message;
          this.errorMsg.set(
            Array.isArray(apiMsg)
              ? apiMsg.join(' · ')
              : apiMsg || 'Ocurrió un error inesperado.',
          );
        }
      },
    });
  }

  private decorate(c: Cupon): CuponView {
    const exp = new Date(c.fecha_expiracion);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const vencido = diff < 0;
    const agotado =
      c.usos_maximos !== null && c.usos_actuales >= c.usos_maximos;
    const porcentaje = String(c.tipo).toLowerCase().includes('porc');
    return {
      ...c,
      diasRestantes: Math.max(0, diff),
      vencido,
      agotado,
      porcentaje,
      copiado: false,
    };
  }

  tituloCupon(c: CuponView): string {
    if (c.porcentaje) return `${c.valor}% de descuento`;
    return `L ${c.valor} de descuento`;
  }

  formatFecha(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  copy(c: CuponView): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(c.codigo).then(() => {
      this.cupones.update((list) =>
        list.map((x) => (x.id === c.id ? { ...x, copiado: true } : x)),
      );
      setTimeout(() => {
        this.cupones.update((list) =>
          list.map((x) => (x.id === c.id ? { ...x, copiado: false } : x)),
        );
      }, 1500);
    });
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

  logout(): void {
    this.auth.logoutRemote().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.locationSvc.clear();
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }
}
