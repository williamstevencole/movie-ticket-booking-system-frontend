import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta-guardada',
  standalone: true,
  templateUrl: './tarjeta-guardada.component.html',
  styleUrl: './tarjeta-guardada.component.scss',
})
export class TarjetaGuardadaComponent {
  @Input() metodoPago: 'tarjeta' | 'efectivo' = 'tarjeta';

  @Input() ultimosDigitos = '4242';
}
