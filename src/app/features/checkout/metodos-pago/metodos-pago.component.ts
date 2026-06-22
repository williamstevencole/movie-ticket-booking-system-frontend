import { Component, computed, signal } from '@angular/core';
import { MOCK_PELICULA_DETALLE } from '../../../mocks/data/cartelera-display.mock';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { EfectivoComponent } from './efectivo/efectivo.component';
import { CuponComponent } from '../cupon/cupon.component';
import { StepperComponent } from '../stepper/stepper.component';
import { ResumenComponent } from '../resumen/resumen.component';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [
    TarjetaComponent,
    EfectivoComponent,
    CuponComponent,
    StepperComponent,
    ResumenComponent,
  ],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss',
})
export class MetodosPagoComponent {
  pelicula = MOCK_PELICULA_DETALLE;

  readonly politicaAceptada = signal(false);

  readonly numeroReserva = signal('#CT-48291');

  readonly sala = signal('Sala 5');

  readonly horario = signal('Hoy · 8:30 PM');

  readonly asientos = signal(['A3', 'A4']);

  readonly subtotal = signal(9);

  readonly total = signal(12);

  //metodo pago stuff
  readonly metodoPago = signal<'tarjeta' | 'efectivo'>('tarjeta');

  //cupon stuff

  readonly precioOriginal = signal(12);

  readonly descuento = signal(3);

  readonly descuentoAplicado = signal(true);

  // TODO: replace with the real ISO date from session/reservation state once wired end-to-end.
  // MOCK_PELICULA_DETALLE (PeliculaDetalle) does not carry a fecha_hora/fechaHora field —
  // that lives on the Funcion entity (Funciones.fecha_hora), which is not yet passed into
  // this component. Placeholder is 1 hour from now so efectivo remains enabled during
  // development. When the Funcion is available: use funcion.fecha_hora instead.
  readonly fechaHoraFuncion = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  readonly totalFinal = computed(() => {
    return this.precioOriginal() - this.descuento();
  });
}
