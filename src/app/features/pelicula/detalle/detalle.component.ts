import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
    <app-pelicula-hero [pelicula]="pelicula()" [esProximamente]="esProximamente()" />
    <app-pelicula-funciones
      [peliculaId]="peliculaId"
      [fechaEstreno]="pelicula().fecha_estreno ?? null"
      [esProximamente]="esProximamente()"
    />

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
    { label: 'Cupones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly pelicula = signal<PeliculaDetalle>({ ...MOCK_PELICULA_DETALLE });

  readonly esProximamente = computed(() => this.pelicula().puede_reservar === false);

  // null = desconocido/cargando, true = puede calificar, false = no elegible
  readonly elegible = signal<boolean | null>(null);
  readonly miVoto = signal<number | null>(null);

  readonly auth = inject(AuthService);
  private readonly cartelera = inject(CarteleraService);
  private readonly calificaciones = inject(CalificacionesService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly peliculaIdSignal = signal<string>('');

  get peliculaId(): string {
    return this.peliculaIdSignal();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id || id === this.peliculaIdSignal()) return;
      this.peliculaIdSignal.set(id);
      this.cargar(id);
    });
  }

  private cargar(id: string): void {
    this.cartelera.detalle(id).subscribe({
      next: (p) => this.pelicula.set(p),
      error: () => this.toast.show('No se pudo cargar la película'),
    });

    if (!this.auth.isAuthenticated()) {
      this.elegible.set(false);
      this.miVoto.set(null);
      return;
    }

    this.elegible.set(null);
    this.miVoto.set(null);
    this.calificaciones.obtenerMia(id).subscribe({
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
