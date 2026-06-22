import { Component, Input } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { BoletoMock } from '../../../../mocks/data/boletos.mock';


@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [
    QRCodeComponent
  ],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrBoletoComponent {

  @Input() boleto!: BoletoMock;


  get codigoQR() {
    return `CINE-${this.boleto.id}`;
  }


  get codigoRespaldo() {
    return '04318';
  }

}