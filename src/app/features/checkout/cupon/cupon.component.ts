import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCheck } from '@lucide/angular';
import { CuponesService } from '../../../shared/services/cupones.service';

@Component({
  selector: 'app-cupon',
  standalone: true,
  imports: [CommonModule, LucideCheck],
  templateUrl: './cupon.component.html',
  styleUrl: './cupon.component.scss',
})
export class CuponComponent {
  private readonly cuponesSvc = inject(CuponesService);

  @Input() precioOriginal = 0;
  @Output() descuentoAplicado = new EventEmitter<number>();
  @Output() codigoCambio = new EventEmitter<string | null>();

  readonly codigo = signal('');
  readonly aplicado = signal(false);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly descuento = signal(0);

  aplicar(): void {
    const code = this.codigo().trim().toUpperCase();
    if (!code) return;
    this.cargando.set(true);
    this.error.set(null);
    this.cuponesSvc.validar(code).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (!res.valido || !res.cupon) {
          this.error.set(res.mensaje ?? `Código "${code}" no válido.`);
          this.codigoCambio.emit(null);
          return;
        }
        const valor = typeof res.cupon.valor === 'string' ? Number(res.cupon.valor) : res.cupon.valor;
        const monto =
          res.cupon.tipo === 'porcentaje'
            ? Math.round(this.precioOriginal * (valor / 100))
            : Math.min(valor, this.precioOriginal);
        this.descuento.set(monto);
        this.aplicado.set(true);
        this.descuentoAplicado.emit(monto);
        this.codigoCambio.emit(code);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(`Código "${code}" no válido.`);
        this.codigoCambio.emit(null);
      },
    });
  }

  quitar(): void {
    this.descuento.set(0);
    this.aplicado.set(false);
    this.codigo.set('');
    this.descuentoAplicado.emit(0);
    this.codigoCambio.emit(null);
  }
}
