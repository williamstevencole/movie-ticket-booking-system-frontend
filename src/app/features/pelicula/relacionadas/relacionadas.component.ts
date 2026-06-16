import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MOCK_CARTELERA } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-peliculas-relacionadas',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="related-block">
      <h3>También en cartelera</h3>
      <div class="related-card">
        <div class="related-card-head">Más vistas hoy</div>
        @for (p of items(); track p.id) {
          <a [routerLink]="['/pelicula', p.id]" class="related-row">
            <span class="mini-poster poster" [class]="p.poster"></span>
            <span>
              <span class="ti">{{ p.titulo }}</span>
              <span class="me">{{ p.genero }} · {{ p.duracion }}</span>
            </span>
          </a>
        }
      </div>
    </div>
  `,
  styleUrl: './relacionadas.component.scss',
})
export class PeliculasRelacionadasComponent {
  @Input({ required: true }) excludeId!: string;

  items() {
    return MOCK_CARTELERA.filter((p) => p.id !== this.excludeId).slice(0, 4);
  }
}
