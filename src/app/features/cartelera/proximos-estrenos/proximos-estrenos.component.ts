import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-proximos-estrenos',
  standalone: true,
  imports: [RouterLink, AppbarComponent, FooterComponent, PosterBadgeComponent],
  template: `
    <app-appbar [navItems]="nav" />

    <main class="page wrap">
      <header class="head">
        <h1>Próximos estrenos</h1>
        <p>Películas que estrenan después del próximo domingo.</p>
      </header>

      @if (cargando()) {
        <div class="movie-grid">
          @for (s of [1,2,3,4]; track s) {
            <div class="movie-card skeleton">
              <div class="poster"></div>
              <div class="body">
                <div class="sk-line"></div>
                <div class="sk-line short"></div>
              </div>
            </div>
          }
        </div>
      } @else if (proximos().length === 0) {
        <p class="empty">Por ahora no hay próximos estrenos cargados.</p>
      } @else {
        <div class="movie-grid">
          @for (p of proximos(); track p.id) {
            <a [routerLink]="['/pelicula', p.id]" class="movie-card">
              <div class="poster">
                @if (p.poster_url) {
                  <img [src]="p.poster_url" [alt]="p.titulo" loading="lazy" />
                }
                <app-poster-badge tipo="proximamente" />
              </div>
              <div class="body">
                <h3 class="title">{{ p.titulo }}</h3>
                <p class="meta">{{ p.genero }} · {{ p.duracion }}</p>
              </div>
            </a>
          }
        </div>
      }
    </main>

    <app-footer />
  `,
  styleUrl: './proximos-estrenos.component.scss',
})
export class ProximosEstrenosComponent implements OnInit {
  private readonly cartelera = inject(CarteleraService);
  private readonly location = inject(LocationService);

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos', active: true },
    { label: 'Cupones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly peliculas = signal<CarteleraPelicula[]>([]);
  readonly cargando = signal(true);

  readonly proximos = computed(() =>
    this.peliculas().filter((p) => p.puede_reservar === false),
  );

  ngOnInit(): void {
    const ciudadId = this.location.selection()?.cityId;
    this.cartelera.listar({ ciudad_id: ciudadId || undefined, limit: 100 }).subscribe({
      next: (list) => {
        this.peliculas.set(list);
        this.cargando.set(false);
      },
      error: () => {
        this.peliculas.set([]);
        this.cargando.set(false);
      },
    });
  }
}
