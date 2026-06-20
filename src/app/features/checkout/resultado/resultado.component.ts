import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultado',
  standalone: true,
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.scss',
})
export class ResultadoComponent {
  constructor(private router: Router) {}

  // true = éxito | false = error
  readonly pagoExitoso = signal(true);

  readonly numeroReserva = signal('#CT-48291');

  readonly metodoPago = signal('Tarjeta');

  readonly monto = signal(12);

  readonly numeroTransaccion = signal('TRX-849201');

  readonly fecha = signal('19/06/2026');

  volverInicio() {
    this.router.navigate(['/']);
  }

  verBoletos() {
    this.router.navigate(['/mis-boletos']);
  }

  intentarNuevamente() {
    this.router.navigate(['/checkout/metodos-pago']);
  }
}
