import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-efectivo',
  standalone: true,
  templateUrl: './efectivo.component.html',
  styleUrl: './efectivo.component.scss',
})
export class EfectivoComponent {
  constructor(private location: Location) {}

  continuar() {
    console.log('Pago en efectivo confirmado');
  }

  volver() {
    this.location.back();
  }
}
