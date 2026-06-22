import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AsientoSeleccionado = {
  codigo: string;
  tipo: 'estandar' | 'vip' | 'accesible';
  precio: number;
};

@Component({
  selector: 'app-panel-lateral',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-lateral.component.html',
  styleUrl: './panel-lateral.component.scss',
})
export class PanelLateralComponent {
  @Input({ required: true }) set asientos(v: AsientoSeleccionado[]) {
    this._asientos.set(v);
  }
  @Input() cargoServicio = 15;

  private readonly _asientos = signal<AsientoSeleccionado[]>([]);
  readonly asientosList = this._asientos.asReadonly();

  readonly subtotal = computed(() =>
    this._asientos().reduce((sum, a) => sum + a.precio, 0),
  );

  badgeTipo(tipo: 'estandar' | 'vip' | 'accesible'): string {
    if (tipo === 'vip') return 'VIP · Reclinable';
    if (tipo === 'accesible') return 'Accesible';
    return 'Estándar';
  }
}
