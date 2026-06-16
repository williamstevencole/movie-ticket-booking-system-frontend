import {
  Component,
  signal,
  OnDestroy,
  HostListener,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideStar, LucidePlay } from '@lucide/angular';
import { MOCK_HERO_SLIDES } from '../../../mocks/data/cartelera-display.mock';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { PeliculaRatingComponent } from '../../pelicula/rating/rating.component';

const ROTATE_MS = 7000;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideStar,
    LucidePlay,
    PosterBadgeComponent,
    PeliculaRatingComponent,
  ],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  readonly slides = MOCK_HERO_SLIDES;
  readonly index = signal(0);
  readonly paused = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  @HostListener('mouseenter')
  onEnter(): void {
    this.paused.set(true);
    this.stopTimer();
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.paused.set(false);
    this.startTimer();
  }

  @HostListener('keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0]?.clientX ?? 0;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent): void {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - this.touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
  }

  goTo(i: number): void {
    this.index.set(i);
  }

  next(): void {
    this.index.update((i) => (i + 1) % this.slides.length);
  }

  prev(): void {
    this.index.update(
      (i) => (i - 1 + this.slides.length) % this.slides.length,
    );
  }

  truncate(text: string, max = 280): string {
    return text.length <= max ? text : text.slice(0, max - 1) + '…';
  }

  private startTimer(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.paused()) this.next();
    }, ROTATE_MS);
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
