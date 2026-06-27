import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MOCK_PELICULA_DETALLE, PeliculaDetalle } from '../../../mocks/data/cartelera-display.mock';
import { PeliculaHeroComponent } from '../hero/hero.component';
import { PeliculaFuncionesComponent } from '../funciones/funciones.component';
import { FichaTecnicaComponent } from '../ficha-tecnica/ficha-tecnica.component';
import { PeliculasRelacionadasComponent } from '../relacionadas/relacionadas.component';
import { RatingInputComponent } from '../../../shared/components/rating-input/rating-input.component';
import { AuthService } from '../../../shared/services/auth.service';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { CalificacionesService, ResultadoCalificacion } from '../../../shared/services/calificaciones.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-pelicula-detalle',
  standalone: true,
  imports: [
    AppbarComponent,
    FooterComponent,
    PeliculaHeroComponent,
    PeliculaFuncionesComponent,
    FichaTecnicaComponent,
    PeliculasRelacionadasComponent,
    RatingInputComponent,
  ],
  template: `
    <app-appbar [navItems]="nav" />
    <app-pelicula-hero [pelicula]="pelicula()" />
    <app-pelicula-funciones [peliculaId]="peliculaId" />

    <section class="calificar-section wrap">
      @if (auth.isAuthenticated()) {
        @if (elegible() === false) {
          <p class="muted">Podrás calificar después de asistir a una función.</p>
        } @else if (elegible() === true) {
          <h3>{{ miVoto() != null ? 'Tu calificación' : 'Calificá esta película' }}</h3>
          <app-rating-input
            [valor]="miVoto()"
            (calificar)="onCalificar($event)"
            (borrar)="onBorrar()"
          />
        }
      }
    </section>

    <section class="credits-section">
      <div class="wrap credits-grid">
        <app-ficha-tecnica [ficha]="pelicula().ficha" />
        <app-peliculas-relacionadas [excludeId]="pelicula().id" />
      </div>
    </section>
    <app-footer />
  `,
  styleUrl: './detalle.component.scss',
})
export class PeliculaDetalleComponent implements OnInit {
  readonly nav = [
    { label: 'Cartelera', route: '/cartelera', active: true },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly pelicula = signal<PeliculaDetalle>({ ...MOCK_PELICULA_DETALLE });

  // null = desconocido/cargando, true = puede calificar, false = no elegible
  readonly elegible = signal<boolean | null>(null);
  readonly miVoto = signal<number | null>(null);

  readonly auth = inject(AuthService);
  private readonly cartelera = inject(CarteleraService);
  private readonly calificaciones = inject(CalificacionesService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  get peliculaId(): string {
    return this.route.snapshot.paramMap.get('id') ?? this.pelicula().id;
  }

  ngOnInit(): void {
    this.cartelera.detalle(this.peliculaId).subscribe({
      next: (p) => this.pelicula.set(p),
      error: () => this.toast.show('No se pudo cargar la película'),
    });

    if (!this.auth.isAuthenticated()) {
      this.elegible.set(false);
      return;
    }

    // TODO: When wired to real backend, HTTP 403 means not eligible (no ticket attended).
    // The mock always returns null (no vote) or { puntuacion } — 403 branch won't fire in mock.
    this.calificaciones.obtenerMia(this.peliculaId).subscribe({
      next: (r) => {
        this.elegible.set(true);
        this.miVoto.set(r?.puntuacion ?? null);
      },
      error: (e: { status?: number }) => {
        if (e?.status === 403) {
          this.elegible.set(false);
        } else {
          this.elegible.set(null);
        }
      },
    });
  }

  onCalificar(puntuacion: number): void {
    const prev = this.miVoto();
    this.miVoto.set(puntuacion); // optimistic
    this.calificaciones.calificar(this.peliculaId, puntuacion).subscribe({
      next: (r) => this.actualizarPeli(r),
      error: () => {
        this.miVoto.set(prev);
        this.toast.show('No se pudo guardar tu calificación');
      },
    });
  }

  onBorrar(): void {
    const prev = this.miVoto();
    this.miVoto.set(null); // optimistic
    this.calificaciones.borrar(this.peliculaId).subscribe({
      next: (r) => this.actualizarPeli(r),
      error: () => {
        this.miVoto.set(prev);
        this.toast.show('No se pudo borrar tu voto');
      },
    });
  }

  private actualizarPeli(r: ResultadoCalificacion): void {
    this.pelicula.update((p) => ({
      ...p,
      rating_promedio: r.rating_promedio,
      rating_count: r.rating_count,
    }));
  }
}
