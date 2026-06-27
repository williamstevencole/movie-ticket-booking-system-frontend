import { Component, signal, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LucideSearch, LucideX } from '@lucide/angular';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { BusquedaFiltrosComponent, FiltrosBusqueda } from '../filtros/filtros.component';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-busqueda-resultados',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    LucideSearch,
    LucideX,
    AppbarComponent,
    FooterComponent,
    PosterBadgeComponent,
    BusquedaFiltrosComponent,
  ],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss',
})
export class BusquedaResultadosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartelera = inject(CarteleraService);
  private location = inject(LocationService);
  private destroyRef = inject(DestroyRef);

  private readonly tipeo$ = new Subject<string>();

  readonly nav = [
    { label: 'Cartelera', route: '/cartelera' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly query = signal('');
  readonly filtros = signal<FiltrosBusqueda>({ genero: '', idioma: '' });
  readonly cargando = signal(false);
  readonly error = signal(false);
  readonly resultados = signal<CarteleraPelicula[]>([]);

  ngOnInit(): void {
    // La URL (?q=&genero=&idioma=) es la fuente de verdad: dispara la consulta.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      this.query.set(p.get('q') ?? '');
      this.filtros.set({ genero: p.get('genero') ?? '', idioma: p.get('idioma') ?? '' });
      this.fetch();
    });

    // El tipeo, con debounce, sincroniza la URL (que a su vez consulta).
    this.tipeo$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: q.trim() || null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }

  onQueryChange(value: string): void {
    this.query.set(value); // refleja el tipeo al instante
    this.tipeo$.next(value);
  }

  clearQuery(): void {
    this.query.set('');
    this.tipeo$.next('');
  }

  onFiltros(f: FiltrosBusqueda): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genero: f.genero || null, idioma: f.idioma || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Consulta el backend aplicando título + filtros + ciudad seleccionada. */
  private fetch(): void {
    const f = this.filtros();
    const ciudadId = this.location.selection()?.cityId;
    this.cargando.set(true);
    this.error.set(false);
    this.cartelera
      .listar({
        titulo: this.query().trim() || undefined,
        genero: f.genero || undefined,
        idioma: f.idioma || undefined,
        ciudad_id: ciudadId || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.resultados.set(list);
          this.cargando.set(false);
        },
        error: () => {
          this.resultados.set([]);
          this.cargando.set(false);
          this.error.set(true);
        },
      });
  }
}
