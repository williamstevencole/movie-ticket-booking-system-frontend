import { Component, inject, signal, DestroyRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideSearch, LucideX } from '@lucide/angular';
import { debounceTime, distinctUntilChanged, switchMap, of, catchError, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarteleraService } from '../../services/cartelera.service';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

const RECENT_KEY = 'cinetario_busqueda_recientes';

@Component({
  selector: 'app-buscador-global',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideSearch, LucideX],
  template: `
    <button class="search-mini" (click)="open()" aria-label="Buscar películas">
      <svg lucideSearch [size]="16"></svg>
      <span>Buscar</span>
    </button>

    @if (visible()) {
      <div class="overlay" (click)="close()" role="presentation">
        <div class="panel" (click)="$event.stopPropagation()" role="dialog" aria-label="Búsqueda global">
          <div class="panel-head">
            <svg lucideSearch [size]="20" class="ico"></svg>
            <input
              #inputEl
              class="search-input"
              type="search"
              placeholder="Buscar películas, cines…"
              [value]="query()"
              (input)="onInput($event)"
              autofocus
            />
            <button class="close" (click)="close()" aria-label="Cerrar búsqueda">
              <svg lucideX [size]="18"></svg>
            </button>
          </div>

          @if (query().length === 0 && recientes().length > 0) {
            <div class="section-label">Recientes</div>
            <ul class="results">
              @for (r of recientes(); track r) {
                <li>
                  <button class="result-row" (click)="goSearch(r)">{{ r }}</button>
                </li>
              }
            </ul>
          }

          @if (query().length > 0) {
            <div class="section-label">Películas</div>
            <ul class="results">
              @for (p of resultados(); track p.id) {
                <li>
                  <a
                    class="result-row rich"
                    [routerLink]="['/pelicula', p.id]"
                    (click)="pick(p.titulo)"
                  >
                    <span class="mini-poster poster" [class]="p.poster">
                      @if (p.poster_url) {
                        <img [src]="p.poster_url" [alt]="p.titulo" loading="lazy" />
                      }
                    </span>
                    <span>
                      <span class="ti">{{ p.titulo }}</span>
                      <span class="me">{{ p.genero }}</span>
                    </span>
                  </a>
                </li>
              } @empty {
                <li class="empty">
                  @if (cargando()) {
                    Buscando…
                  } @else {
                    Sin resultados para «{{ query() }}»
                  }
                </li>
              }
            </ul>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './buscador-global.component.scss',
})
export class BuscadorGlobalComponent {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cartelera = inject(CarteleraService);
  private search$ = new Subject<string>();

  readonly visible = signal(false);
  readonly query = signal('');
  readonly cargando = signal(false);
  readonly resultados = signal<CarteleraPelicula[]>([]);
  readonly recientes = signal<string[]>(this.loadRecientes());

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          const term = q.trim();
          if (!term) {
            this.cargando.set(false);
            return of([] as CarteleraPelicula[]);
          }
          this.cargando.set(true);
          return this.cartelera.buscar(term, 6).pipe(catchError(() => of([] as CarteleraPelicula[])));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((list) => {
        this.resultados.set(list);
        this.cargando.set(false);
      });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.visible() ? this.close() : this.open();
    }
    if (e.key === 'Escape' && this.visible()) this.close();
  }

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.query.set('');
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.query.set(v);
    this.search$.next(v);
  }

  goSearch(term: string): void {
    this.pick(term);
    this.router.navigate(['/buscar'], { queryParams: { q: term } });
  }

  pick(term: string): void {
    const list = [term, ...this.recientes().filter((x) => x !== term)].slice(0, 5);
    this.recientes.set(list);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    this.close();
  }

  private loadRecientes(): string[] {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  }
}
