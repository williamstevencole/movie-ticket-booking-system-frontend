import { Component, Input } from '@angular/core';
import { LucidePlay } from '@lucide/angular';
import { PeliculaDetalle } from '../../../mocks/data/cartelera-display.mock';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { PeliculaRatingComponent } from '../rating/rating.component';
import { PeliculaTaglineComponent } from './tagline.component';

@Component({
  selector: 'app-pelicula-hero',
  standalone: true,
  imports: [
    LucidePlay,
    PosterBadgeComponent,
    PeliculaRatingComponent,
    PeliculaTaglineComponent,
  ],
  template: `
    <section class="film-hero">
      <div class="film-hero-inner">
        <div class="poster" [class]="pelicula.poster">
          <app-poster-badge [tipo]="pelicula.badge" />
        </div>
        <div>
          <div class="film-meta-row">
            <span class="pill red">★ {{ pelicula.badgeLabel }}</span>
            <span class="pill">{{ pelicula.genero }}</span>
            <span class="pill">{{ pelicula.duracion }}</span>
            <span class="pill">{{ pelicula.idioma }}</span>
            <span class="pill">{{ pelicula.clasificacion }}</span>
            <app-pelicula-rating
              [valor]="pelicula.rating"
              [total]="pelicula.ratingCount"
              variant="large"
              [showMax]="false"
            />
          </div>
          <h1>{{ pelicula.titulo }}</h1>
          <app-pelicula-tagline [texto]="pelicula.tagline" />
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
            <a href="#funciones" class="btn btn-primary btn-lg">
              <svg lucidePlay [size]="16"></svg>
              Ver funciones
            </a>
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
}
