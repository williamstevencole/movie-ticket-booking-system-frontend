import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pelicula-rating',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (total === 0) {
      <span class="rating empty" [class]="variant">Sin calificaciones</span>
    } @else {
      <span
        class="rating"
        [class]="variant"
        [attr.title]="'Basado en ' + total + ' calificaciones'"
        [attr.aria-label]="'Calificación ' + valor + ' de 5, basado en ' + total + ' calificaciones'"
      >
        <span class="star" aria-hidden="true">★</span>
        @if (variant === 'large') {
          <span class="val tnum">{{ valor | number:'1.1-1' }}</span>
        } @else {
          <span class="val tnum">{{ valor | number:'1.1-1' }}</span>
          @if (showMax) {
            <span class="max">/ 5.0</span>
          }
        }
      </span>
    }
  `,
  styles: `
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
    }
    .star { color: var(--orange); }
    .compact-dark {
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      color: white;
    }
    .compact { color: var(--text); }
    .large {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    .large .star { font-size: 18px; }
    .empty { color: var(--text-3); font-weight: 500; }
    .max { color: var(--text-3); font-weight: 500; }
    .compact-dark .max { color: rgba(255,255,255,0.6); }
  `,
})
export class PeliculaRatingComponent {
  @Input({ required: true }) valor = 0;
  @Input() total = 0;
  @Input() variant: 'compact' | 'compact-dark' | 'large' = 'compact';
  @Input() showMax = true;
}
