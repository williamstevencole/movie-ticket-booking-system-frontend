import { Component, computed, signal } from '@angular/core';
import { MOCK_PELICULA_DETALLE } from '../../../mocks/data/cartelera-display.mock';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { EfectivoComponent } from './efectivo/efectivo.component';
import { CuponComponent } from '../cupon/cupon.component';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [TarjetaComponent, EfectivoComponent, CuponComponent],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss',
})
export class MetodosPagoComponent {
  pelicula = MOCK_PELICULA_DETALLE;

  readonly numeroReserva = signal('#CT-48291');

  readonly sala = signal('Sala 5');

  readonly horario = signal('Hoy · 8:30 PM');

  readonly asientos = signal(['A3', 'A4']);

  readonly total = signal(12);

  //metodo pago stuff
  readonly metodoPago = signal<'tarjeta' | 'efectivo'>('tarjeta');

  //cupon stuff

  readonly precioOriginal = signal(12);

  readonly descuento = signal(3);

  readonly descuentoAplicado = signal(true);

  readonly totalFinal = computed(() => {
    return this.precioOriginal() - this.descuento();
  });
}
