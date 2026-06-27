import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HorarioVM } from '../../../../shared/services/pelicula-cines.service';

@Component({
  selector: 'app-horario-chip',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (horario.asientosLibres !== undefined && horario.asientosLibres <= 0) {
      <span class="time-card full">
        <span class="h tnum">{{ horario.hora }}</span>
        <span class="av">agotado</span>
      </span>
    } @else {
      <a
        class="time-card"
        [class.warn]="horario.asientosLibres !== undefined && horario.asientosLibres <= warningThreshold"
        [routerLink]="['/sala', horario.funcionId]"
      >
        <span class="h tnum">{{ horario.hora }}</span>
        @if (horario.asientosLibres !== undefined) {
          <span class="av">{{ horario.asientosLibres }} libres</span>
        } @else {
          <span class="av">ver asientos</span>
        }
      </a>
    }
  `,
  styleUrl: './horario-chip.component.scss',
})
export class HorarioChipComponent {
  @Input({ required: true }) horario!: HorarioVM;
  @Input() warningThreshold = 20;
}
