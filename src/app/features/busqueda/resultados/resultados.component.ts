import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { BusquedaFiltrosComponent, FiltrosBusqueda } from '../filtros/filtros.component';
import { MOCK_CARTELERA } from '../../../mocks/data/cartelera-display.mock';

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

  readonly nav = [
    { label: 'Cartelera', route: '/cartelera' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly query = signal('');
  readonly filtros = signal<FiltrosBusqueda>({ genero: '', idioma: '', clasificacion: '' });
  readonly resultados = signal(MOCK_CARTELERA);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((p) => {
      this.query.set(p.get('q') ?? '');
      this.apply();
    });
  }

  onFiltros(f: FiltrosBusqueda): void {
    this.filtros.set(f);
    this.apply();
  }

  private apply(): void {
    const q = this.query().trim().toLowerCase();
    const f = this.filtros();
    let list = MOCK_CARTELERA;
    if (q) {
      list = list.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.genero.toLowerCase().includes(q),
      );
    }
    if (f.genero) list = list.filter((p) => p.genero === f.genero);
    if (f.idioma) list = list.filter((p) => p.idioma === f.idioma);
    if (f.clasificacion) list = list.filter((p) => p.clasificacion === f.clasificacion);
    this.resultados.set(list);
  }
}
