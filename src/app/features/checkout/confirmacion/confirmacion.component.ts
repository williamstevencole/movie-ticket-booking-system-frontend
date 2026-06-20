import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';
import { MOCK_PELICULA_DETALLE } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss',
})
export class ConfirmacionComponent {
  constructor(private location: Location) {}

  readonly sala = signal('Sala 5');

  readonly horario = signal('Hoy · 8:30 PM');

  readonly asientos = signal(['A3', 'A4']);

  readonly subtotal = signal(12);

  pelicula = MOCK_PELICULA_DETALLE;

  volver() {
    this.location.back();
  }
}
