import {
  Component,
  ElementRef,
  HostListener,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideDownload,
  LucideFileSpreadsheet,
  LucideFileText,
} from '@lucide/angular';
import { ToastService } from '../services/toast.service';

export type ExportColumn<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number | null | undefined;
};

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [
    CommonModule,
    LucideDownload,
    LucideFileSpreadsheet,
    LucideFileText,
  ],
  template: `
    @if (exporting()) {
      <span class="exporting-pill">
        <span class="spinner"></span>
        Exportando {{ formatLabel() }}…
      </span>
    } @else {
      <div class="menu-wrap">
        <button
          type="button"
          class="btn"
          (click)="toggleMenu()"
          [disabled]="rows.length === 0"
          [attr.aria-expanded]="open()"
        >
          <svg lucideDownload [size]="16"></svg>
          <span>Exportar</span>
        </button>

        @if (open()) {
          <div class="menu" role="menu">
            <button class="menu-item" (click)="exportCsv()">
              <svg lucideFileSpreadsheet [size]="18"></svg>
              <span class="label">
                <span class="label-title">CSV</span>
                <span class="label-sub">Descarga inmediata</span>
              </span>
            </button>
            <button class="menu-item" (click)="exportPdf()">
              <svg lucideFileText [size]="18"></svg>
              <span class="label">
                <span class="label-title">PDF</span>
                <span class="label-sub">Genera el documento</span>
              </span>
            </button>
          </div>
        }
      </div>
    }
  `,
  styleUrl: './export-button.component.scss',
})
export class ExportButtonComponent {
  private host = inject(ElementRef<HTMLElement>);
  private toast = inject(ToastService);

  @Input({ required: true }) filename!: string;
  @Input({ required: true }) columns!: ExportColumn<any>[];
  @Input({ required: true }) rows!: any[];

  readonly open = signal(false);
  readonly exporting = signal(false);
  readonly formatLabel = signal<'CSV' | 'PDF'>('CSV');

  toggleMenu() { this.open.update((v) => !v); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.open.set(false); }

  exportCsv() {
    this.open.set(false);
    this.formatLabel.set('CSV');
    this.exporting.set(true);
    setTimeout(() => {
      try {
        this.downloadCsv();
        this.toast.show(`CSV descargado · ${this.rows.length} registros`);
      } catch {
        this.toast.show('No se pudo generar el CSV');
      }
      this.exporting.set(false);
    }, 600);
  }

  exportPdf() {
    this.open.set(false);
    this.formatLabel.set('PDF');
    this.exporting.set(true);
    setTimeout(() => {
      this.toast.show(`PDF listo · ${this.rows.length} registros (simulado)`);
      this.exporting.set(false);
    }, 900);
  }

  private downloadCsv() {
    const escape = (v: unknown): string => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const header = this.columns.map((c) => escape(c.label)).join(',');
    const lines = this.rows.map((row) =>
      this.columns.map((c) => escape(c.value(row))).join(','),
    );
    const csv = '﻿' + [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
