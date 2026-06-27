import { Component, signal, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { BusquedaFiltrosComponent, FiltrosBusqueda } from '../filtros/filtros.component';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-busqueda-resultados',
  standalone: true,
  imports: [
    RouterLink,
    LucideSearch,
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
  private cartelera = inject(CarteleraService);
  private destroyRef = inject(DestroyRef);

  readonly nav = [
    { label: 'Cartelera', route: '/cartelera' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly query = signal('');
  readonly filtros = signal<FiltrosBusqueda>({ genero: '', idioma: '', clasificacion: '' });
  readonly cargando = signal(false);
  readonly error = signal(false);
  private readonly fetched = signal<CarteleraPelicula[]>([]);
  readonly resultados = signal<CarteleraPelicula[]>([]);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      this.query.set(p.get('q') ?? '');
      this.fetch();
    });
  }

  onFiltros(f: FiltrosBusqueda): void {
    this.filtros.set(f);
    this.apply();
  }

  private fetch(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.cartelera
      .buscar(this.query().trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.fetched.set(list);
          this.cargando.set(false);
          this.apply();
        },
        error: () => {
          this.fetched.set([]);
          this.cargando.set(false);
          this.error.set(true);
          this.apply();
        },
      });
  }

  private apply(): void {
    const f = this.filtros();
    let list = this.fetched();
    if (f.genero) list = list.filter((p) => p.genero === f.genero);
    if (f.idioma) list = list.filter((p) => p.idioma === f.idioma);
    if (f.clasificacion) list = list.filter((p) => p.clasificacion === f.clasificacion);
    this.resultados.set(list);
  }
}
