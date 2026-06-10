import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideArrowRight,
  LucideCheck,
  LucideMapPin,
  LucideLogOut,
  LucideAlertCircle,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import {
  Ciudad,
  CiudadesService,
} from '../../shared/services/ciudades.service';
import {
  Cine,
  CinesService,
} from '../../shared/services/cines.service';
import { LocationService } from '../../shared/services/location.service';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [
    CommonModule,
    LucideArrowRight,
    LucideCheck,
    LucideMapPin,
    LucideLogOut,
    LucideAlertCircle,
  ],
  template: `
    <!-- TOP STRIP -->
    <header class="top">
      <a class="brand" (click)="goHome()" tabindex="0">
        <span class="mark">C</span>
        <span class="name">Cinetario</span>
      </a>

      <div class="steps" aria-label="Paso del onboarding">
        <span class="step-label">{{ stepLabel() }}</span>
        <span class="dot" [class.on]="true" aria-hidden="true"></span>
        <span class="dot" [class.on]="selectedCityId() !== null" aria-hidden="true"></span>
      </div>

      <button class="signout" (click)="logout()" type="button" [attr.aria-label]="'Cerrar sesión'">
        <svg lucideLogOut [size]="16"></svg>
        <span>Cerrar sesión</span>
      </button>
    </header>

    <!-- HERO ─ pregunta ─ -->
    <section class="hero">
      <div class="hero-text">
        <div class="kicker">Hola{{ firstName() ? ', ' + firstName() : '' }}</div>
        <h1>
          ¿Dónde vas a ver cine <span class="accent">hoy?</span>
        </h1>
        <p>
          Elegí la ciudad donde estás y después el cine que tenés más a mano.
          Vas a poder cambiar tu selección en cualquier momento desde el menú.
        </p>
      </div>
      <div class="hero-decor" aria-hidden="true">
        <div class="ticket-stub">
          <div class="stub-row"><span>CINETARIO</span><span>{{ todayLabel() }}</span></div>
          <div class="stub-sep"></div>
          <div class="stub-section">
            <span class="stub-label">Ciudad</span>
            <span class="stub-value">{{ selectedCityName() ?? '—' }}</span>
          </div>
          <div class="stub-section">
            <span class="stub-label">Cine</span>
            <span class="stub-value">{{ selectedCinemaName() ?? '—' }}</span>
          </div>
          <div class="stub-sep"></div>
          <div class="stub-row">
            <span>SALA</span><span>—</span>
          </div>
        </div>
      </div>
    </section>

    <!-- BODY -->
    <main class="body">

      <!-- ─── PASO 1: ciudad ─── -->
      <section class="step" id="paso-1">
        <header class="step-head">
          <span class="step-num">01</span>
          <div>
            <h2>Tu ciudad</h2>
            <p>De estas {{ ciudades().length || '' }} <span>·</span> elegí la que estás visitando.</p>
          </div>
        </header>

        @if (loadingCities()) {
          <div class="state-row">
            <div class="state-spinner"></div>
            <span>Cargando ciudades…</span>
          </div>
        } @else if (errorCities()) {
          <div class="state-row error">
            <svg lucideAlertCircle [size]="18"></svg>
            <span>{{ errorCities() }}</span>
            <button class="ghost-btn" (click)="loadCities()">Reintentar</button>
          </div>
        } @else {
          <div class="city-grid">
            @for (c of ciudades(); track c.id) {
              <button
                class="city-card"
                type="button"
                [class.on]="selectedCityId() === c.id"
                (click)="pickCity(c)"
              >
                <span class="city-tag">{{ c.id }}</span>
                <span class="city-name">{{ c.nombre }}</span>
                @if (selectedCityId() === c.id) {
                  <span class="city-check" aria-hidden="true">
                    <svg lucideCheck [size]="14"></svg>
                  </span>
                }
              </button>
            }
          </div>
        }
      </section>

      <!-- ─── PASO 2: cine ─── -->
      <section class="step" id="paso-2" [class.locked]="selectedCityId() === null">
        <header class="step-head">
          <span class="step-num">02</span>
          <div>
            <h2>Tu cine</h2>
            <p>
              @if (selectedCityName(); as city) {
                Cines disponibles en <strong>{{ city }}</strong>.
              } @else {
                Primero elegí una ciudad para ver los cines.
              }
            </p>
          </div>
        </header>

        @if (selectedCityId() !== null) {
          @if (loadingCines()) {
            <div class="state-row">
              <div class="state-spinner"></div>
              <span>Buscando cines en {{ selectedCityName() }}…</span>
            </div>
          } @else if (errorCines()) {
            <div class="state-row error">
              <svg lucideAlertCircle [size]="18"></svg>
              <span>{{ errorCines() }}</span>
              <button class="ghost-btn" (click)="loadCines()">Reintentar</button>
            </div>
          } @else if (cines().length === 0) {
            <div class="empty-row">
              <p>
                Todavía no hay cines registrados en
                <strong>{{ selectedCityName() }}</strong>. Probá con otra ciudad
                — o volvé más tarde.
              </p>
            </div>
          } @else {
            <div class="cine-list">
              @for (k of cines(); track k.id) {
                <button
                  class="cine-card"
                  type="button"
                  [class.on]="selectedCinemaId() === k.id"
                  (click)="pickCinema(k)"
                >
                  <div class="cine-info">
                    <div class="cine-row">
                      <h3>{{ k.nombre }}</h3>
                      @if (selectedCinemaId() === k.id) {
                        <span class="cine-check">
                          <svg lucideCheck [size]="14"></svg>
                        </span>
                      }
                    </div>
                    @if (k.direccion) {
                      <p class="cine-addr">
                        <svg lucideMapPin [size]="13"></svg>
                        <span>{{ k.direccion }}</span>
                      </p>
                    }
                  </div>
                  <div class="cine-meta">
                    <span class="cine-salas">
                      <strong>{{ k.salas.length || 0 }}</strong>
                      {{ k.salas.length === 1 ? 'sala' : 'salas' }}
                    </span>
                  </div>
                </button>
              }
            </div>
          }
        }
      </section>

    </main>

    <!-- STICKY BAR -->
    <footer class="dock" [class.ready]="canContinue()">
      <div class="dock-summary">
        <div class="dock-icon">
          <svg lucideMapPin [size]="18"></svg>
        </div>
        <div class="dock-text">
          <div class="dock-eyebrow">Tu selección</div>
          <div class="dock-value">
            @if (selectedCityName(); as city) {
              <span>{{ city }}</span>
              @if (selectedCinemaName(); as cine) {
                <span class="dock-sep">·</span>
                <span>{{ cine }}</span>
              } @else {
                <span class="dock-pending">— elegí un cine</span>
              }
            } @else {
              <span class="dock-pending">Elegí ciudad y cine</span>
            }
          </div>
        </div>
      </div>

      <button
        type="button"
        class="cta"
        (click)="confirm()"
        [disabled]="!canContinue()"
      >
        <span>Continuar</span>
        <svg lucideArrowRight [size]="18"></svg>
      </button>
    </footer>
  `,
  styleUrl: './location-selector.component.scss',
})
export class LocationSelectorComponent implements OnInit {
  private ciudadesSvc = inject(CiudadesService);
  private cinesSvc = inject(CinesService);
  private locationSvc = inject(LocationService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loadingCities = signal(true);
  readonly errorCities = signal<string | null>(null);
  readonly ciudades = signal<Ciudad[]>([]);

  readonly loadingCines = signal(false);
  readonly errorCines = signal<string | null>(null);
  readonly cines = signal<Cine[]>([]);

  readonly selectedCityId = signal<string | null>(null);
  readonly selectedCinemaId = signal<string | null>(null);

  readonly selectedCityName = computed(() => {
    const id = this.selectedCityId();
    if (!id) return null;
    return this.ciudades().find((c) => c.id === id)?.nombre ?? null;
  });

  readonly selectedCinemaName = computed(() => {
    const id = this.selectedCinemaId();
    if (!id) return null;
    return this.cines().find((c) => c.id === id)?.nombre ?? null;
  });

  readonly canContinue = computed(
    () => this.selectedCityId() !== null && this.selectedCinemaId() !== null,
  );

  readonly stepLabel = computed(() => {
    if (this.selectedCityId() === null) return 'Paso 1 de 2';
    return 'Paso 2 de 2';
  });

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.loadingCities.set(true);
    this.errorCities.set(null);
    this.ciudadesSvc.list().subscribe({
      next: (list) => {
        // ordenar alfabéticamente para que sea predecible
        const sorted = [...list].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es'),
        );
        this.ciudades.set(sorted);
        this.loadingCities.set(false);

        // si hay ubicación previa guardada, pre-seleccionarla
        const prev = this.locationSvc.selection();
        if (prev) {
          const exists = sorted.find((c) => c.id === prev.cityId);
          if (exists) {
            this.selectedCityId.set(prev.cityId);
            this.loadCines(prev.cinemaId);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingCities.set(false);
        this.errorCities.set(this.errorMessage(err));
      },
    });
  }

  pickCity(c: Ciudad): void {
    if (this.selectedCityId() === c.id) return;
    this.selectedCityId.set(c.id);
    this.selectedCinemaId.set(null);
    this.cines.set([]);
    this.loadCines();
  }

  loadCines(preSelectCinemaId: string | null = null): void {
    const id = this.selectedCityId();
    if (!id) return;
    this.loadingCines.set(true);
    this.errorCines.set(null);
    this.cinesSvc.list({ id_ciudad: id, limit: 100 }).subscribe({
      next: (page) => {
        this.cines.set(page.data);
        this.loadingCines.set(false);
        if (preSelectCinemaId) {
          const exists = page.data.find((c) => c.id === preSelectCinemaId);
          if (exists) this.selectedCinemaId.set(preSelectCinemaId);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingCines.set(false);
        this.errorCines.set(this.errorMessage(err));
      },
    });
  }

  pickCinema(k: Cine): void {
    this.selectedCinemaId.set(k.id);
  }

  confirm(): void {
    if (!this.canContinue()) return;
    const city = this.ciudades().find((c) => c.id === this.selectedCityId());
    const cine = this.cines().find((c) => c.id === this.selectedCinemaId());
    if (!city || !cine) return;
    this.locationSvc.set({
      cityId: city.id,
      cityName: city.nombre,
      cinemaId: cine.id,
      cinemaName: cine.nombre,
      cinemaAddress: cine.direccion,
    });
    this.router.navigateByUrl('/cartelera');
  }

  goHome(): void {
    if (this.locationSvc.hasSelection()) {
      this.router.navigateByUrl('/cartelera');
    }
  }

  firstName(): string | null {
    const name = this.auth.user()?.nombre ?? '';
    const first = name.trim().split(' ')[0];
    return first || null;
  }

  todayLabel(): string {
    return new Date().toLocaleDateString('es-HN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }).toUpperCase();
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

  private errorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No pudimos conectar con el servidor. ¿Está arriba la API?';
    }
    const apiMsg = (err.error as { message?: string | string[] })?.message;
    if (Array.isArray(apiMsg)) return apiMsg.join(' · ');
    return apiMsg || 'Ocurrió un error inesperado.';
  }
}
