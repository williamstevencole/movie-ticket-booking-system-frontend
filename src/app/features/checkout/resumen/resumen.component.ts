import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.scss',
})
export class ResumenComponent {
  // Cantidad de asientos seleccionados
  cantidad = input<number>(0);

  // Precio total de boletos antes del cargo
  subtotal = input<number>(0);

  // Cargo configurable desde mock
  cargoServicio = input<number>(0);

  total = computed(() => this.subtotal() + this.cargoServicio());

  tieneCargo = computed(() => this.cargoServicio() > 0);
}
