import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { ToastService } from '../../../../shared/services/toast.service';
import { BoletosService } from '../../../../shared/services/boletos.service';

interface BoletoConNumero {
  numero_reserva: string;
}

@Component({
  selector: 'app-descargar-boleto',
  standalone: true,
  templateUrl: './descargar-boleto.component.html',
  styleUrl: './descargar-boleto.component.scss',
})
export class DescargarBoletoComponent implements OnInit {
  @Input({ required: true }) boleto!: BoletoConNumero;

  private readonly toast = inject(ToastService);
  private readonly boletos = inject(BoletosService);

  readonly downloadUrl = signal<string>('');
  readonly fileName = signal<string>('boleto.pdf');

  ngOnInit(): void {
    this.boletos.obtenerCodigoFirmado(this.boleto.numero_reserva).subscribe({
      next: (codigo) => {
        this.downloadUrl.set(this.boletos.urlPdf(codigo, 'download'));
        this.fileName.set(`boleto-${this.boleto.numero_reserva}.pdf`);
      },
      error: () => this.toast.show('No se pudo preparar la descarga del boleto.'),
    });
  }
}
