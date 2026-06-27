import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LucideArrowRight, LucideCheck } from '@lucide/angular';
import { ProximoEstreno } from '../../../mocks/data/cartelera-display.mock';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

const SUBS_KEY = 'cinetario_proximamente_subs';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [LucideArrowRight, LucideCheck, PosterBadgeComponent],
  template: `
    @if (peliculas().length > 0) {
      <section class="section wrap">
        <div class="section-head">
          <h2>Próximamente</h2>
          <a class="link">Calendario completo <svg lucideArrowRight [size]="14"></svg></a>
        </div>
        <div class="movie-grid">
          @for (p of peliculas(); track p.id) {
            <article class="movie-card">
              <div class="poster dim" [class]="p.poster">
                @if (p.poster_url) {
                  <img [src]="p.poster_url" [alt]="p.titulo" loading="lazy" />
                }
                <app-poster-badge tipo="fecha" [fecha]="p.badgeFecha" />
                <span class="title-overlay">{{ p.titulo }}</span>
              </div>
              <div class="body">
                <h3 class="title">{{ p.titulo }}</h3>
                <div class="meta">
                  <span>{{ p.genero }}</span>
                  <span class="sep">·</span>
                  <span>{{ p.duracion }}</span>
                </div>
                <button
                  type="button"
                  class="btn btn-sm notify"
                  [class.subscribed]="isSubscribed(p.id)"
                  (click)="toggleNotify(p.id)"
                >
                  @if (isSubscribed(p.id)) {
                    <svg lucideCheck [size]="14"></svg>
                    Te avisaremos
                  } @else {
                    Notificarme
                  }
                </button>
              </div>
            </article>
          }
        </div>
      </section>
    }
  `,
  styleUrl: './proximamente.component.scss',
})
export class ProximamenteComponent implements OnInit {
  private toast = inject(ToastService);
  private cartelera = inject(CarteleraService);
  private platformId = inject(PLATFORM_ID);

  readonly peliculas = signal<ProximoEstreno[]>([]);
  readonly subscribed = signal<Set<string>>(new Set());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = JSON.parse(localStorage.getItem(SUBS_KEY) ?? '[]') as string[];
        this.subscribed.set(new Set(raw));
      } catch { /* ignore */ }
    }
  }

  ngOnInit(): void {
    this.cartelera.proximos().subscribe({
      next: (list) => this.peliculas.set(list),
      error: () => this.peliculas.set([]),
    });
  }

  isSubscribed(id: string): boolean {
    return this.subscribed().has(id);
  }

  toggleNotify(id: string): void {
    const next = new Set(this.subscribed());
    if (next.has(id)) {
      next.delete(id);
      this.toast.show('Te desuscribiste de este estreno');
    } else {
      next.add(id);
      this.toast.show('Te avisaremos cuando se estrene');
    }
    this.subscribed.set(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(SUBS_KEY, JSON.stringify([...next]));
    }
  }
}
