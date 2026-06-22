import { Component, Input } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [QRCodeComponent],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrBoletoComponent {
  @Input({ required: true }) numeroReserva!: string;

  get codigoQR(): string {
    return `CINE-${this.numeroReserva}`;
  }

  get codigoRespaldo(): string {
    return this.numeroReserva;
  }
}
