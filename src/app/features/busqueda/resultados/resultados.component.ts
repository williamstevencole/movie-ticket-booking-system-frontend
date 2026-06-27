import { Component, signal, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
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
  private location = inject(LocationService);
  private destroyRef = inject(DestroyRef);

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
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      this.query.set(p.get('q') ?? '');
      this.fetch();
    });
  }

  onFiltros(f: FiltrosBusqueda): void {
    this.filtros.set(f);
    this.fetch();
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
