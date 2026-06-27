import {
  Component,
  OnInit,
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
import {
  HeroSlide,
  CarteleraPelicula,
} from '../../../mocks/data/cartelera-display.mock';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
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
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private cartelera = inject(CarteleraService);
  private location = inject(LocationService);

  readonly slides = signal<HeroSlide[]>([]);
  readonly index = signal(0);
  readonly paused = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  ngOnInit(): void {
    const ciudadId = this.location.selection()?.cityId;
    this.cartelera.listar({ ciudad_id: ciudadId || undefined, limit: 5 }).subscribe({
      next: (list) => {
        this.slides.set(list.map((p) => this.toSlide(p)));
        this.index.set(0);
        if (isPlatformBrowser(this.platformId) && this.slides().length > 1) {
          this.startTimer();
        }
      },
      error: () => this.slides.set([]),
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private toSlide(p: CarteleraPelicula): HeroSlide {
    return {
      id: p.id,
      titulo: p.titulo,
      genero: p.genero,
      duracion: p.duracion,
      idioma: p.idioma,
      clasificacion: p.clasificacion ?? '',
      rating: p.rating_promedio ?? 0,
      ratingCount: p.rating_count ?? 0,
      sinopsis: p.sinopsis ?? '',
      poster: '',
      poster_url: p.poster_url,
      badge: p.badge ?? null,
      badgeLabel: p.badge === 'estreno' ? 'ESTRENO HOY' : 'EN CARTELERA',
    };
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
    const n = this.slides().length;
    if (n === 0) return;
    this.index.update((i) => (i + 1) % n);
  }

  prev(): void {
    const n = this.slides().length;
    if (n === 0) return;
    this.index.update((i) => (i - 1 + n) % n);
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
