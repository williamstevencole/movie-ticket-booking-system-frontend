import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_PELICULA_DETALLE } from '../../../mocks/data/cartelera-display.mock';
import { StepperComponent } from '../stepper/stepper.component';
import { ResumenComponent } from '../resumen/resumen.component';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [StepperComponent, ResumenComponent],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss',
})
export class ConfirmacionComponent {
  constructor(
    private location: Location,
    private router: Router,
  ) {}

  readonly sala = signal('Sala 5');

  readonly horario = signal('Hoy · 8:30 PM');

  readonly asientos = signal(['A3', 'A4']);

  readonly subtotal = signal(12);

  pelicula = MOCK_PELICULA_DETALLE;

  volver() {
    this.location.back();
  }

  continuarPago() {
    this.router.navigate(['/checkout/metodos-pago']);
  }
}
