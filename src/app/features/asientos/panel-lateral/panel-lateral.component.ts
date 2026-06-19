import { Component, Input } from '@angular/core';
import { Asiento } from '../mapa/seat-types/asiento.model';
import { TimerComponent } from '../timer/timer.component';

@Component({
  selector: 'app-panel-lateral',
  standalone: true,
  imports: [TimerComponent],
  templateUrl: './panel-lateral.component.html',
  styleUrl: './panel-lateral.component.scss',
})
export class PanelLateralComponent {
  @Input()
  asientosSeleccionados: Asiento[] = [];
}
