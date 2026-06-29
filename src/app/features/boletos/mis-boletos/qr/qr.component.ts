import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { BoletosService } from '../../../../shared/services/boletos.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [QRCodeComponent],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrBoletoComponent implements OnInit {
  @Input({ required: true }) numeroReserva!: string;

  private readonly boletos = inject(BoletosService);
  readonly codigoQR = signal<string>('');

  ngOnInit(): void {
    this.boletos.obtenerCodigoFirmado(this.numeroReserva).subscribe({
      next: (codigo) => {
        const url = new URL(this.boletos.urlPdf(codigo, 'inline'), window.location.origin).toString();
        this.codigoQR.set(url);
      },
      error: () => this.codigoQR.set(this.numeroReserva),
    });
  }

  get codigoRespaldo(): string {
    return this.numeroReserva;
  }
}
