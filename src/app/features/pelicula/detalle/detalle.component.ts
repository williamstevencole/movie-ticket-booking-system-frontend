import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MOCK_PELICULA_DETALLE } from '../../../mocks/data/cartelera-display.mock';
import { PeliculaHeroComponent } from '../hero/hero.component';
import { PeliculaFuncionesComponent } from '../funciones/funciones.component';
import { FichaTecnicaComponent } from '../ficha-tecnica/ficha-tecnica.component';
import { PeliculasRelacionadasComponent } from '../relacionadas/relacionadas.component';

@Component({
  selector: 'app-pelicula-detalle',
  standalone: true,
  imports: [
    AppbarComponent,
    FooterComponent,
    PeliculaHeroComponent,
    PeliculaFuncionesComponent,
    FichaTecnicaComponent,
    PeliculasRelacionadasComponent,
  ],
  template: `
    <app-appbar [navItems]="nav" />
    <app-pelicula-hero [pelicula]="pelicula" />
    <app-pelicula-funciones />
    <section class="credits-section">
      <div class="wrap credits-grid">
        <app-ficha-tecnica [ficha]="pelicula.ficha" />
        <app-peliculas-relacionadas [excludeId]="pelicula.id" />
      </div>
    </section>
    <app-footer />
  `,
  styleUrl: './detalle.component.scss',
})
export class PeliculaDetalleComponent {
  readonly nav = [
    { label: 'Cartelera', route: '/cartelera', active: true },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly pelicula = MOCK_PELICULA_DETALLE;

  constructor(private route: ActivatedRoute) {
    /* id disponible en route para integración API */
    void this.route.snapshot.paramMap.get('id');
  }
}
