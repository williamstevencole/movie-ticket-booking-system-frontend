import { Component, Input } from '@angular/core';
import { LucidePlay } from '@lucide/angular';
import { PeliculaDetalle } from '../../../mocks/data/cartelera-display.mock';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { PeliculaRatingComponent } from '../rating/rating.component';
import { PeliculaTaglineComponent } from './tagline.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'app-pelicula-hero',
  standalone: true,
  imports: [
    LucidePlay,
    PosterBadgeComponent,
    PeliculaRatingComponent,
    PeliculaTaglineComponent,
    RatingDisplayComponent,
  ],
  template: `
    <section class="film-hero">
      <div class="film-hero-inner">
        <div class="poster" [class]="pelicula.poster">
          @if (pelicula.poster_url) {
            <img [src]="pelicula.poster_url" [alt]="pelicula.titulo" />
          }
          <app-poster-badge [tipo]="pelicula.badge" />
        </div>
        <div>
          <div class="film-meta-row">
            @if (pelicula.badgeLabel) {
              <span class="pill red">★ {{ pelicula.badgeLabel }}</span>
            }
            <span class="pill">{{ pelicula.genero }}</span>
            <span class="pill">{{ pelicula.duracion }}</span>
            <span class="pill">{{ pelicula.idioma }}</span>
            @if (pelicula.clasificacion) {
              <span class="pill">{{ pelicula.clasificacion }}</span>
            }
            <app-pelicula-rating
              [valor]="pelicula.rating"
              [total]="pelicula.ratingCount"
              variant="large"
              [showMax]="false"
            />
          </div>
          <h1>{{ pelicula.titulo }}</h1>
          <app-pelicula-tagline [texto]="pelicula.tagline" />
          <app-rating-display
            [promedio]="pelicula.rating_promedio"
            [count]="pelicula.rating_count ?? 0"
            size="lg"
          />
          <p class="film-syn">{{ pelicula.sinopsis }}</p>
          <div class="film-attrs">
            @for (a of pelicula.attrs; track a.label) {
              <div class="at">
                <div class="l">{{ a.label }}</div>
                <div class="v">{{ a.value }}</div>
              </div>
            }
          </div>
          <div class="film-cta">
            <button type="button" class="btn btn-primary btn-lg" (click)="scrollToFunciones()">
              <svg lucidePlay [size]="16"></svg>
              Ver funciones
            </button>
            <button type="button" class="btn btn-lg btn-trailer">Tráiler oficial</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero.component.scss',
})
export class PeliculaHeroComponent {
  @Input({ required: true }) pelicula!: PeliculaDetalle;

  /** Scroll a la sección de funciones (anchorScrolling del router está deshabilitado). */
  scrollToFunciones(): void {
    document
      .getElementById('funciones')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
