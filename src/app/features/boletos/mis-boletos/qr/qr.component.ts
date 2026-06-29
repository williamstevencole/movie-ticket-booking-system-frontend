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
    this.boletos.codigoYUrl(this.numeroReserva).subscribe({
      next: ({ url }) => this.codigoQR.set(url),
      error: () => this.codigoQR.set(this.numeroReserva),
    });
  }

  get codigoRespaldo(): string {
    return this.numeroReserva;
  }
}
