import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-peliculas-relacionadas',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items().length > 0) {
      <div class="related-block">
        <h3>También en cartelera</h3>
        <div class="related-card">
          @for (p of items(); track p.id) {
            <a [routerLink]="['/pelicula', p.id]" class="related-row">
              @if (p.poster_url) {
                <img class="mini-poster" [src]="p.poster_url" [alt]="p.titulo" loading="lazy" />
              } @else {
                <span class="mini-poster poster"></span>
              }
              <span>
                <span class="ti">{{ p.titulo }}</span>
                <span class="me">{{ p.genero }} · {{ p.duracion }}</span>
              </span>
            </a>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './relacionadas.component.scss',
})
export class PeliculasRelacionadasComponent implements OnChanges {
  private readonly cartelera = inject(CarteleraService);
  private readonly location = inject(LocationService);

  @Input({ required: true }) excludeId!: string;

  readonly items = signal<CarteleraPelicula[]>([]);

  ngOnChanges(): void {
    const ciudadId = this.location.selection()?.cityId;
    this.cartelera.listar({ ciudad_id: ciudadId || undefined, limit: 8 }).subscribe({
      next: (list) => {
        this.items.set(list.filter((p) => p.id !== this.excludeId).slice(0, 4));
      },
      error: () => this.items.set([]),
    });
  }
}
