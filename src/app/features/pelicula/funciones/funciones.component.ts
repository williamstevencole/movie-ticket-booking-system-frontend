import { Component, signal } from '@angular/core';
import { MOCK_FUNCIONES } from '../../../mocks/data/funciones.mock';
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
  readonly cines = MOCK_FUNCIONES;
  readonly selectedCineId = signal(MOCK_FUNCIONES[0]!.id);

  selectCine(id: string): void {
    this.selectedCineId.set(id);
  }

  selectedCine() {
    return this.cines.find((c) => c.id === this.selectedCineId()) ?? this.cines[0]!;
  }

  mapsUrl(lat: number, lng: number): string {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }
}
