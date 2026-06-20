import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-cupon',
  standalone: true,
  templateUrl: './cupon.component.html',
  styleUrl: './cupon.component.scss',
})
export class CuponComponent {
  readonly codigo = signal('');

  readonly descuento = signal(0);

  aplicar() {
    if (this.codigo().trim().toUpperCase() === 'CINE25') {
      this.descuento.set(25);
      return;
    }

    this.descuento.set(0);
  }
}