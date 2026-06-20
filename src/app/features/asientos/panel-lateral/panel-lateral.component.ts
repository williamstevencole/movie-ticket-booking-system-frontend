import { Component, Input } from '@angular/core';
import { Asiento } from '../mapa/asiento.model';
import { TimerComponent } from '../timer/timer.component';
import { CtaComponent } from '../cta/cta.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(
    private location: Location,
    private router: Router,
  ) {}

  volver() {
    this.location.back();
  }

  continuarPago() {
    this.router.navigate(['/checkout/confirmacion']);
  }
}
