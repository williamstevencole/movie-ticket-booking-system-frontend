import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideMapPin,
  LucideLogOut,
  LucideSearch,
  LucideArrowRight,
  LucideTicket,
  LucideCopy,
  LucideCheck,
  LucideChevronDown,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import { Cupon, CuponesService } from '../../shared/services/cupones.service';
import { LocationService } from '../../shared/services/location.service';
import { HeroCarouselComponent } from '../../shared/components/cartelera/hero-carousel.component';
import { ProximamenteComponent } from '../../shared/components/cartelera/proximamente.component';

interface Pelicula {
  titulo: string;
  genero: string;
  duracion: string;
  idioma: string;
  poster: string;
  tag?: 'estreno' | 'vip' | 'ultima';
  funciones: { hora: string; full?: boolean }[];
}

interface CuponPreview extends Cupon {
  porcentaje: boolean;
  copiado: boolean;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideMapPin,
    LucideLogOut,
    LucideSearch,
    LucideArrowRight,
    LucideTicket,
    LucideCopy,
    LucideCheck,
    LucideMapPin,      
    LucideArrowRight,
    LucideChevronDown,
    HeroCarouselComponent,
    ProximamenteComponent,
  ],
  template: `
    <!-- HEADER -->
    <header class="appbar">
      <div class="appbar-inner">
        <a class="brand" routerLink="/cartelera"
          ><span class="mark">C</span>Cinetario</a
        >
        <nav class="appnav">
          <a routerLink="/cartelera" class="on">Cartelera</a>
          <a>Próximos estrenos</a>
          <a routerLink="/cupones">Cupones</a>
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
            <span class="citychip-name">{{
              cinemaName() ?? 'Elegí un cine'
            }}</span>
            @if (cityName(); as city) {
              <span class="citychip-city">· {{ city }}</span>
            }
          </a>
          <div class="user">
            <span class="avatar">{{ initials() }}</span>
            <button
              class="logout"
              (click)="logout()"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <svg lucideLogOut [size]="16"></svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <app-hero-carousel></app-hero-carousel>

    <!-- CITY BAR -->
    <div class="city-bar">
      <div class="wrap">
        <div class="city-selector">
          <div class="dropdown-trigger">
            <svg lucideMapPin [size]="16" class="icon-pin"></svg>
            <span class="label">Cine:</span>
            <span class="current-city">San Pedro Sula (Multiplaza)</span>
            <svg lucideChevronDown [size]="14" class="icon-arrow"></svg>
          </div>

          <div class="dropdown-menu">
            <ul class="dropdown-list">
              <li class="dropdown-item active">San Pedro Sula (Multiplaza)</li>
              <li class="dropdown-item">Tegucigalpa (Cascadas)</li>
              <li class="dropdown-item">La Ceiba</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- WELCOME -->
    <div class="welcome">
      <div class="wrap">
        Bienvenido, <strong>{{ userName() }}</strong> — esta es la cartelera de
        tu ciudad para hoy.
      </div>
    </div>

    <!-- CUPONES STRIP -->
    @if (cuponesPreview().length > 0) {
      <section class="cupones-strip wrap">
        <div class="strip-head">
          <div>
            <div class="strip-kicker">
              <svg lucideTicket [size]="14"></svg>
              <span>Cupones disponibles</span>
            </div>
            <h2>Aprovechá un descuento hoy</h2>
          </div>
          <a routerLink="/cupones" class="link">
            <span>Ver todos los cupones</span>
            <svg lucideArrowRight [size]="14"></svg>
          </a>
        </div>
        <div class="strip-grid">
          @for (c of cuponesPreview(); track c.id) {
            <article class="mini-cupon">
              <div class="mc-left">
                <div class="mc-value">
                  @if (c.porcentaje) {
                    <span class="num">{{ c.valor }}</span
                    ><span class="sym">%</span>
                  } @else {
                    <span class="sym pre">L</span
                    ><span class="num">{{ c.valor }}</span>
                  }
                </div>
                <div class="mc-tag">
                  {{ c.porcentaje ? 'Descuento' : 'Monto fijo' }}
                </div>
              </div>
              <div class="mc-right">
                <div class="mc-code">{{ c.codigo }}</div>
                <button
                  class="mc-copy"
                  (click)="copy(c)"
                  [class.copied]="c.copiado"
                  [attr.aria-label]="'Copiar código ' + c.codigo"
                >
                  @if (c.copiado) {
                    <svg lucideCheck [size]="13"></svg>
                    <span>Copiado</span>
                  } @else {
                    <svg lucideCopy [size]="13"></svg>
                    <span>Copiar</span>
                  }
                </button>
              </div>
            </article>
          }
        </div>
      </section>
    }

    <!-- DAY STRIP -->
    <section class="day-section wrap">
      <div class="day-strip">
        @for (d of days; track d.num) {
          <button class="day" [class.on]="d.on">
            <span class="wd">{{ d.wd }}</span>
            <span class="num">{{ d.num }}</span>
            <span class="mn">{{ d.mn }}</span>
          </button>
        }
      </div>
    </section>

    <!-- PROXIMAMENTE -->
    <app-proximamente></app-proximamente>

    <!-- CARTELERA -->
    <main class="wrap">
      <div class="section-head">
        <h2>Estrenos esta semana</h2>
        <a class="link">
          <span>Ver todos</span>
          <svg lucideArrowRight [size]="14"></svg>
        </a>
      </div>

      <div class="movie-grid">
        @for (p of peliculas; track p.titulo) {
          <article class="movie-card">
            <div class="poster" [class]="p.poster">
              @if (p.tag === 'estreno') {
                <span class="badge new">ESTRENO</span>
              }
              @if (p.tag === 'vip') {
                <span class="badge vip">VIP</span>
              }
              @if (p.tag === 'ultima') {
                <span class="badge last">ÚLT. SEM</span>
              }
              <span class="poster-title">{{ p.titulo }}</span>
            </div>
            <div class="body">
              <h3 class="title">{{ p.titulo }}</h3>
              <div class="meta">
                <span>{{ p.genero }}</span>
                <span class="sep">·</span>
                <span>{{ p.duracion }}</span>
                <span class="sep">·</span>
                <span>{{ p.idioma }}</span>
              </div>
              <div class="times">
                @for (f of p.funciones; track f.hora) {
                  <span class="time" [class.full]="f.full">{{ f.hora }}</span>
                }
              </div>
            </div>
          </article>
        }
      </div>
    </main>

    <footer class="appfoot">
      <div class="wrap">
        © 2026 Cinetario · sesión como <strong>{{ user()?.email }}</strong> ({{
          role()
        }})
      </div>
    </footer>
  `,
  styleUrl: './home.component.scss',
})
export class ClientHomeComponent implements OnInit {
  private auth = inject(AuthService);
  private cuponesSvc = inject(CuponesService);
  private locationSvc = inject(LocationService);
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly role = this.auth.role;
  readonly cinemaName = this.locationSvc.cinemaName;
  readonly cityName = this.locationSvc.cityName;

  readonly cuponesPreview = signal<CuponPreview[]>([]);

  ngOnInit(): void {
    this.loadCupones();
  }

  private loadCupones(): void {
    this.cuponesSvc.list().subscribe({
      next: (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activos = data
          .filter((c) => {
            if (!c.activo) return false;
            const exp = new Date(c.fecha_expiracion);
            if (exp.getTime() < today.getTime()) return false;
            if (c.usos_maximos !== null && c.usos_actuales >= c.usos_maximos)
              return false;
            return true;
          })
          .slice(0, 3)
          .map((c) => ({
            ...c,
            porcentaje: String(c.tipo).toLowerCase().includes('porc'),
            copiado: false,
          }));
        this.cuponesPreview.set(activos);
      },
      error: () => {
        // silencioso: si no carga, simplemente no se muestra el strip
        this.cuponesPreview.set([]);
      },
    });
  }

  copy(c: CuponPreview): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(c.codigo).then(() => {
      this.cuponesPreview.update((list) =>
        list.map((x) => (x.id === c.id ? { ...x, copiado: true } : x)),
      );
      setTimeout(() => {
        this.cuponesPreview.update((list) =>
          list.map((x) => (x.id === c.id ? { ...x, copiado: false } : x)),
        );
      }, 1500);
    });
  }

  userName(): string {
    return this.user()?.nombre?.split(' ')[0] ?? 'invitado';
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

  logout() {
    this.auth.logoutRemote().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout() {
    this.locationSvc.clear();
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }

  readonly days = [
    { wd: 'Lun', num: '08', mn: 'Jun', on: false },
    { wd: 'Mar', num: '09', mn: 'Jun', on: false },
    { wd: 'Mié', num: '10', mn: 'Jun', on: true },
    { wd: 'Jue', num: '11', mn: 'Jun', on: false },
    { wd: 'Vie', num: '12', mn: 'Jun', on: false },
    { wd: 'Sáb', num: '13', mn: 'Jun', on: false },
    { wd: 'Dom', num: '14', mn: 'Jun', on: false },
  ];

  readonly peliculas: Pelicula[] = [
    {
      titulo: 'La hora del lobo',
      genero: 'Drama',
      duracion: '118m',
      idioma: 'VOSE',
      poster: 'poster-1',
      tag: 'estreno',
      funciones: [
        { hora: '15:00' },
        { hora: '18:30' },
        { hora: '21:30' },
        { hora: '23:45' },
      ],
    },
    {
      titulo: 'El faro al sur',
      genero: 'Misterio',
      duracion: '126m',
      idioma: 'ESP',
      poster: 'poster-2',
      funciones: [
        { hora: '14:30' },
        { hora: '18:00' },
        { hora: '21:15', full: true },
      ],
    },
    {
      titulo: 'Ciudades de papel',
      genero: 'Romance',
      duracion: '108m',
      idioma: 'VOSE',
      poster: 'poster-3',
      funciones: [{ hora: '15:00' }, { hora: '19:30' }],
    },
    {
      titulo: 'Vientos del este',
      genero: 'Aventura',
      duracion: '134m',
      idioma: 'ESP',
      poster: 'poster-4',
      funciones: [{ hora: '13:45' }, { hora: '17:00' }, { hora: '20:30' }],
    },
    {
      titulo: 'La frontera blanca',
      genero: 'Thriller',
      duracion: '116m',
      idioma: 'VOSE',
      poster: 'poster-5',
      tag: 'ultima',
      funciones: [
        { hora: '16:15' },
        { hora: '19:00', full: true },
        { hora: '22:00' },
      ],
    },
    {
      titulo: 'Nadadores de agosto',
      genero: 'Comedia',
      duracion: '92m',
      idioma: 'ESP',
      poster: 'poster-6',
      tag: 'vip',
      funciones: [{ hora: '14:00' }, { hora: '17:45' }, { hora: '20:15' }],
    },
  ];
}
