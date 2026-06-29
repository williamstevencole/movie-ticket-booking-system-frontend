import { jsPDF } from 'jspdf';

export type ExportColumn<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number | null | undefined;
};

export interface ReportExportOptions<T> {
  /** Nombre base del archivo (sin extensión). */
  filename: string;
  /** Título mostrado en el encabezado. Si se omite, se deriva del filename. */
  title?: string;
  columns: ExportColumn<T>[];
  rows: T[];
}

// Paleta del documento (RGB), alineada con el sistema de diseño de la app.
const RED: [number, number, number] = [193, 39, 45];
const INK: [number, number, number] = [38, 34, 30];
const MUTED: [number, number, number] = [120, 113, 108];
const LINE: [number, number, number] = [224, 222, 220];
const STRIPE: [number, number, number] = [247, 246, 245];
const HEAD_BG: [number, number, number] = [38, 34, 30];

function reportTitle(filename: string, title?: string): string {
  if (title) return title;
  const base = filename.replace(/[-_]+/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function generatedAt(): string {
  return new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Descarga un CSV tabular simple (UTF-8 con BOM): fila de encabezados + datos.
 * Sin metadatos arriba, para que las columnas queden alineadas en Excel.
 */
export function downloadReportCsv<T>(opts: ReportExportOptions<T>): void {
  const { filename, columns, rows } = opts;

  const escape = (v: unknown): string => {
    const s = fmt(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escape(c.value(row))).join(','),
  );
  const csv = '﻿' + [header, ...lines].join('\r\n');

  triggerDownload(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    `${filename}.csv`,
  );
}

/** Genera y descarga un PDF (apaisado) con el branding de la app y una tabla. */
export function downloadReportPdf<T>(opts: ReportExportOptions<T>): void {
  const { filename, columns: cols, rows } = opts;
  const title = reportTitle(filename, opts.title);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;
  const colW = contentW / cols.length;
  const padX = 2.5;
  const lineH = 4.2;
  const headH = 9;
  const generated = generatedAt();

  const drawBrand = () => {
    pdf.setFillColor(...RED);
    pdf.rect(0, 0, pageW, 3, 'F');
    pdf.setTextColor(...INK);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Cinetario', margin, 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(...MUTED);
    pdf.text(title, margin, 21);
    pdf.setFontSize(8.5);
    pdf.text(
      `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}  ·  Generado ${generated}`,
      pageW - margin,
      15,
      { align: 'right' },
    );
  };

  const drawTableHeader = (y: number): number => {
    pdf.setFillColor(...HEAD_BG);
    pdf.rect(margin, y, contentW, headH, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    cols.forEach((c, i) => {
      const cx = margin + i * colW + padX;
      const label = pdf.splitTextToSize(c.label, colW - padX * 2)[0] ?? '';
      pdf.text(label, cx, y + headH / 2 + 1.6);
    });
    return y + headH;
  };

  let pageNum = 1;
  const drawFooter = () => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text(`Página ${pageNum}`, pageW - margin, pageH - 7, { align: 'right' });
    pdf.text('Cinetario', margin, pageH - 7);
  };

  drawBrand();
  let y = drawTableHeader(28);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...INK);

  rows.forEach((row, ri) => {
    const cellLines = cols.map((c) =>
      pdf.splitTextToSize(fmt(c.value(row)), colW - padX * 2),
    );
    const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
    const rowH = maxLines * lineH + 3;

    // Salto de página
    if (y + rowH > pageH - 12) {
      drawFooter();
      pdf.addPage();
      pageNum++;
      drawBrand();
      y = drawTableHeader(28);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    // Fila cebra
    if (ri % 2 === 1) {
      pdf.setFillColor(...STRIPE);
      pdf.rect(margin, y, contentW, rowH, 'F');
    }

    // Texto de cada celda
    pdf.setTextColor(...INK);
    cols.forEach((c, i) => {
      const cx = margin + i * colW + padX;
      pdf.text(cellLines[i], cx, y + lineH + 0.5);
    });

    // Líneas de la grilla
    pdf.setDrawColor(...LINE);
    pdf.line(margin, y + rowH, margin + contentW, y + rowH);
    for (let i = 1; i < cols.length; i++) {
      pdf.line(margin + i * colW, y, margin + i * colW, y + rowH);
    }
    pdf.line(margin, y, margin, y + rowH);
    pdf.line(margin + contentW, y, margin + contentW, y + rowH);

    y += rowH;
  });

  drawFooter();
  pdf.save(`${filename}.pdf`);
}
