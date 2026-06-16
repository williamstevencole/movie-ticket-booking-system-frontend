import { Component, computed, inject, signal } from '@angular/core';
import { MOCK_FUNCIONES } from '../../../mocks/data/pelicula-funciones.mock';
import { LocationService } from '../../../shared/services/location.service';
import { DayStripComponent } from '../../cartelera/day-strip/day-strip.component';
import { DistanciaCineComponent } from './distancia-cine/distancia-cine.component';
import { HorarioChipComponent } from './horario-chip/horario-chip.component';

@Component({
  selector: 'app-pelicula-funciones',
  standalone: true,
  imports: [
    DayStripComponent,
    DistanciaCineComponent,
    HorarioChipComponent,
  ],
  templateUrl: './funciones.component.html',
  styleUrl: './funciones.component.scss',
})
export class PeliculaFuncionesComponent {
  private location = inject(LocationService);

  readonly cines = MOCK_FUNCIONES;
  readonly selectedCineId = signal(this.resolveInitialCine());

  readonly selectedCine = computed(
    () => this.cines.find((c) => c.id === this.selectedCineId()) ?? this.cines[0]!,
  );

  mapsUrl(lat: number, lng: number): string {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }

  private resolveInitialCine(): string {
    const saved = this.location.cinemaName();
    if (saved) {
      const norm = saved.toLowerCase();
      const match = this.cines.find((c) => c.nombre.toLowerCase().includes(norm));
      if (match) return match.id;
    }
    return this.cines[0]!.id;
  }
}
