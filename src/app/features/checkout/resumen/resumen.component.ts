import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.scss',
})
export class ResumenComponent {
  @Input() pelicula = '';
  @Input() cine = '';
  @Input() sala = '';
  @Input() fechaHora = '';
  @Input() asientos: string[] = [];
  @Input() subtotal = 0;
  @Input() descuento = 0;
  @Input() cargoServicio = 15;
  @Input() numeroReserva: string | null = null;
}
