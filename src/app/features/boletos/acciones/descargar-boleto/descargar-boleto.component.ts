import { Component, Input, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import { ToastService } from '../../../../shared/services/toast.service';
import { Boleto } from '../../../../shared/services/boletos.service';

// Paleta del boleto (RGB)
const RED: [number, number, number] = [193, 39, 45];
const INK: [number, number, number] = [38, 34, 30];
const MUTED: [number, number, number] = [120, 113, 108];
const LINE: [number, number, number] = [228, 226, 224];
const PERF: [number, number, number] = [180, 176, 173];

@Component({
  selector: 'app-descargar-boleto',
  standalone: true,
  templateUrl: './descargar-boleto.component.html',
  styleUrl: './descargar-boleto.component.scss',
})
export class DescargarBoletoComponent {
  @Input() boleto!: Boleto;

  private readonly toast = inject(ToastService);

  descargar() {
    const b = this.boleto;
    if (!b) {
      this.toast.show('No se pudo generar el boleto.');
      return;
    }

    this.toast.show('Tu boleto se está descargando…');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();

    // ── Tarjeta del boleto ──────────────────────────────────────────
    const cardX = 20;
    const cardW = pageW - cardX * 2;
    const cardY = 28;
    const cardH = 172;
    const headerH = 26;
    const padX = cardX + 12;
    const rightX = cardX + cardW - 12;

    // Fondo + borde de la tarjeta
    pdf.setDrawColor(...LINE);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD');

    // Cabecera roja (esquinas superiores redondeadas)
    pdf.setFillColor(...RED);
    pdf.roundedRect(cardX, cardY, cardW, headerH, 4, 4, 'F');
    pdf.rect(cardX, cardY + headerH - 4, cardW, 4, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('CINETARIO', padX, cardY + 16);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('BOLETO ELECTRÓNICO', rightX, cardY + 16, { align: 'right' });

    // ── Título de la película ───────────────────────────────────────
    let cy = cardY + headerH + 14;
    pdf.setTextColor(...INK);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(19);
    const titulo = b.pelicula?.titulo || 'Película';
    const titleLines = pdf.splitTextToSize(titulo, cardW - 24);
    pdf.text(titleLines, padX, cy);
    cy += titleLines.length * 8 + 1;

    // Subtítulo: cine · sala
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...MUTED);
    const cine = b.cine?.nombre || '—';
    const sala = b.sala?.nombre || '—';
    pdf.text(`${cine}  ·  Sala ${sala}`, padX, cy);
    cy += 9;

    // Divisor
    pdf.setDrawColor(...LINE);
    pdf.line(padX, cy, rightX, cy);
    cy += 9;

    // ── Detalles (etiqueta izq. / valor der.) ───────────────────────
    const rows: Array<[string, string]> = [
      ['Fecha', this.formatFecha(b.fecha_hora)],
      ['Hora', this.formatHora(b.fecha_hora)],
      ['Asientos', this.formatAsientos(b)],
      ['Estado', this.estadoLabel(b.estado)],
    ];

    pdf.setFontSize(10.5);
    for (const [label, value] of rows) {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...MUTED);
      pdf.text(label, padX, cy);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...INK);
      const valLines = pdf.splitTextToSize(value, cardW - 50);
      pdf.text(valLines, rightX, cy, { align: 'right' });

      cy += Math.max(8, valLines.length * 6);
    }

    // ── Perforación (línea punteada) ────────────────────────────────
    const perfY = cardY + cardH - 42;
    pdf.setLineDashPattern([1.4, 1.4], 0);
    pdf.setDrawColor(...PERF);
    pdf.line(cardX, perfY, cardX + cardW, perfY);
    pdf.setLineDashPattern([], 0);

    // ── Talón: reserva + total + método ─────────────────────────────
    const stubY = perfY + 11;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    pdf.text('RESERVA', padX, stubY);
    pdf.text('TOTAL', rightX, stubY, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...INK);
    pdf.text(b.numero_reserva || '—', padX, stubY + 8);
    pdf.setTextColor(...RED);
    pdf.text(this.formatMoneda(b.monto_total), rightX, stubY + 8, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.text(`Pago: ${this.metodoPago(b)}`, padX, stubY + 16);

    // ── Nota al pie ─────────────────────────────────────────────────
    pdf.setFontSize(8);
    pdf.setTextColor(150, 146, 142);
    pdf.text(
      'Presentá este boleto (impreso o en pantalla) en la entrada del cine.',
      pageW / 2,
      cardY + cardH + 10,
      { align: 'center' },
    );

    pdf.save(`boleto-${b.numero_reserva || b.id}.pdf`);
  }

  // ── Helpers de formato ────────────────────────────────────────────
  private formatFecha(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const s = d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private formatHora(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  private formatAsientos(b: Boleto): string {
    const list = (b.asientos ?? []).map((a) => a.codigo).filter(Boolean);
    return list.length ? list.join(', ') : '—';
  }

  private formatMoneda(monto: number): string {
    const n = Number.isFinite(monto) ? monto : 0;
    return `L ${n.toFixed(2)}`;
  }

  private metodoPago(b: Boleto): string {
    if (b.ultimos4_snapshot) {
      const marca = this.formatMarca(b.marca_snapshot);
      return `${marca} ****${b.ultimos4_snapshot}`;
    }
    return 'Efectivo · taquilla';
  }

  private formatMarca(marca: Boleto['marca_snapshot']): string {
    switch (marca) {
      case 'visa': return 'Visa';
      case 'master': return 'Mastercard';
      case 'amex': return 'Amex';
      case 'discover': return 'Discover';
      default: return 'Tarjeta';
    }
  }

  private estadoLabel(estado: Boleto['estado']): string {
    switch (estado) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente de pago';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
      default: return String(estado ?? '—');
    }
  }
}
