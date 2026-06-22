import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetaGuardadaComponent } from '../tarjeta-guardada/tarjeta-guardada.component';

@Component({
  selector: 'app-refund-side',
  standalone: true,
  imports: [CommonModule, TarjetaGuardadaComponent],
  templateUrl: './refund-side.component.html',
  styleUrl: './refund-side.component.scss',
})
export class RefundSideComponent {
  @Input() tarjetaMask: string | null = null;
  @Input() tarjetaBrand: string | null = null;
  @Input({ required: true }) montoPagado!: number;
  @Input({ required: true }) porcentajeEstimado!: number;

  get montoReembolso(): number {
    return Math.round((this.montoPagado * this.porcentajeEstimado) / 100);
  }
}
