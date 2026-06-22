import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'app-cupon',
  standalone: true,
  imports: [CommonModule, LucideCheck],
  templateUrl: './cupon.component.html',
  styleUrl: './cupon.component.scss',
})
export class CuponComponent {
  @Input() precioOriginal = 0;
  @Output() descuentoAplicado = new EventEmitter<number>();

  readonly codigo = signal('');
  readonly aplicado = signal(false);
  readonly error = signal<string | null>(null);
  readonly descuento = signal(0);

  aplicar(): void {
    const code = this.codigo().trim().toUpperCase();
    if (code === 'CINE25') {
      const monto = Math.round(this.precioOriginal * 0.25);
      this.descuento.set(monto);
      this.aplicado.set(true);
      this.error.set(null);
      this.descuentoAplicado.emit(monto);
    } else {
      this.error.set(`Código "${code}" no válido.`);
    }
  }

  quitar(): void {
    this.descuento.set(0);
    this.aplicado.set(false);
    this.codigo.set('');
    this.descuentoAplicado.emit(0);
  }
}
