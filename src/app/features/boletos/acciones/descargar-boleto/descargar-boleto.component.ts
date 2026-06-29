import { Component, Input, inject } from '@angular/core';
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
export class DescargarBoletoComponent {
  @Input({ required: true }) boleto!: BoletoConNumero;

  private readonly toast = inject(ToastService);
  private readonly boletos = inject(BoletosService);

  descargar() {
    this.boletos.obtenerCodigoFirmado(this.boleto.numero_reserva).subscribe({
      next: (codigo) => {
        const url = this.boletos.urlPdf(codigo, 'download');
        window.open(url, '_blank', 'noopener');
      },
      error: () => this.toast.show('No se pudo descargar el boleto. Intentá de nuevo.'),
    });
  }
}
