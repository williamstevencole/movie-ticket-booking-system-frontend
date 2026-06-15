import { Component, input, output, signal, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MOCK_CINES_CITY_BAR } from '../../../mocks/data/pelicula-funciones.mock';

const STORAGE_KEY = 'cinetario_cine_filtro';

@Component({
  selector: 'app-city-bar',
  standalone: true,
  template: `
    <div class="city-bar">
      <div class="city-bar-inner wrap">
        <span class="label">Cines:</span>
        <div class="cines">
          @for (c of cines; track c.id) {
            <button
              type="button"
              class="cine-chip"
              [class.on]="selected() === c.id"
              (click)="select(c.id)"
            >{{ c.nombre }}</button>
          }
        </div>
        @if (fechaLabel(); as f) {
          <div class="date-range">
            Mostrando: <strong>{{ f }}</strong>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './city-bar.component.scss',
})
export class CityBarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  readonly fechaLabel = input<string>('');
  readonly cineChange = output<string>();

  readonly cines = MOCK_CINES_CITY_BAR;
  readonly selected = signal('todos');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && this.cines.some((c) => c.id === saved)) {
        this.selected.set(saved);
        this.cineChange.emit(saved);
      }
    }
  }

  select(id: string): void {
    this.selected.set(id);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, id);
    }
    this.cineChange.emit(id);
  }
}
