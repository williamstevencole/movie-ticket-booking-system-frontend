import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-guardada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-guardada.component.html',
  styleUrl: './tarjeta-guardada.component.scss',
})
export class TarjetaGuardadaComponent {
  @Input() tarjetaMask: string | null = null;
  @Input() tarjetaBrand: string | null = null;

  get esEfectivo(): boolean {
    return this.tarjetaMask === null;
  }

  get etiqueta(): string {
    if (this.esEfectivo) return 'Reembolso en taquilla';
    const marca = this.tarjetaBrand ? this.tarjetaBrand.toUpperCase() : 'Tarjeta';
    return `${marca} ${this.tarjetaMask}`;
  }
}
