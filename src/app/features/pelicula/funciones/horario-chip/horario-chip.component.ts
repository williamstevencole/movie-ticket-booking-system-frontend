import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FuncionHorario } from '../../../../mocks/data/funciones.mock';

@Component({
  selector: 'app-horario-chip',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (horario.asientosLibres <= 0) {
      <span class="time-card full">
        <span class="h tnum">{{ horario.hora }}</span>
        <span class="av">agotado</span>
      </span>
    } @else {
      <a
        class="time-card"
        [class.warn]="horario.asientosLibres <= warningThreshold"
        [routerLink]="['/sala', horario.id]"
      >
        <span class="h tnum">{{ horario.hora }}</span>
        <span class="av">{{ horario.asientosLibres }} libres</span>
      </a>
    }
  `,
  styleUrl: './horario-chip.component.scss',
})
export class HorarioChipComponent {
  @Input({ required: true }) horario!: FuncionHorario;
  @Input() warningThreshold = 20;
}
