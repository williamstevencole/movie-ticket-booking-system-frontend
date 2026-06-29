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
import {
  ExportColumn,
  downloadReportCsv,
  downloadReportPdf,
} from '../utils/report-export';

export type { ExportColumn } from '../utils/report-export';

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
                <span class="label-sub">Documento con formato</span>
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
  /** Título mostrado en el encabezado del documento. Si no se pasa, se deriva del filename. */
  @Input() title?: string;

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
        downloadReportCsv({
          filename: this.filename,
          title: this.title,
          columns: this.columns,
          rows: this.rows,
        });
        this.toast.show(`CSV descargado · ${this.rows.length} registros`);
      } catch {
        this.toast.show('No se pudo generar el CSV');
      }
      this.exporting.set(false);
    }, 300);
  }

  exportPdf() {
    this.open.set(false);
    this.formatLabel.set('PDF');
    this.exporting.set(true);
    setTimeout(() => {
      try {
        downloadReportPdf({
          filename: this.filename,
          title: this.title,
          columns: this.columns,
          rows: this.rows,
        });
        this.toast.show(`PDF descargado · ${this.rows.length} registros`);
      } catch {
        this.toast.show('No se pudo generar el PDF');
      }
      this.exporting.set(false);
    }, 300);
  }
}
