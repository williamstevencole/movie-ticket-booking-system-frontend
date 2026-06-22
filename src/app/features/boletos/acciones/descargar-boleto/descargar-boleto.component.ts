import { Component, Input } from '@angular/core';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-descargar-boleto',
  standalone: true,
  templateUrl: './descargar-boleto.component.html',
  styleUrl: './descargar-boleto.component.scss',
})
export class DescargarBoletoComponent {
  @Input() boleto: any;

  descargar() {
    alert('Tu boleto se está descargando…');

    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text('Boleto Cine', 20, 20);

    pdf.setFontSize(12);

    pdf.text(`Numero de reserva: ${this.boleto.id}`, 20, 40);

    pdf.text(`Pelicula: ${this.boleto.pelicula}`, 20, 50);

    pdf.text(`Cine: ${this.boleto.cine}`, 20, 60);

    pdf.text(`Sala: ${this.boleto.sala}`, 20, 70);

    pdf.text(`Asientos: ${this.boleto.asientos.join(', ')}`, 20, 80);

    pdf.save(`boleto-${this.boleto.id}.pdf`);
  }
}
