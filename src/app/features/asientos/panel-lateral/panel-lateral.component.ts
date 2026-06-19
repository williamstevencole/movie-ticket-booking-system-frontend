import { Component, Input } from '@angular/core';
import { Asiento } from '../mapa/seat-types/asiento.model';
import { TimerComponent } from '../timer/timer.component';
import { CtaComponent } from '../cta/cta.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-panel-lateral',
  standalone: true,
  imports: [TimerComponent, CtaComponent],
  templateUrl: './panel-lateral.component.html',
  styleUrl: './panel-lateral.component.scss',
})
export class PanelLateralComponent {
  @Input()
  asientosSeleccionados: Asiento[] = [];

  constructor(private location: Location) {}

  volver() {
    this.location.back();
  }
}
