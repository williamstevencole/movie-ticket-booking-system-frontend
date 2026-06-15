import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideImageUp,
  LucideTrash2,
  LucideUpload,
  LucideTriangleAlert,
  LucideFile,
  LucideRuler,
} from '@lucide/angular';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

@Component({
  selector: 'app-poster-upload',
  standalone: true,
  imports: [
    CommonModule,
    LucideImageUp,
    LucideTrash2,
    LucideUpload,
    LucideTriangleAlert,
    LucideFile,
    LucideRuler,
  ],
  template: `
    <div class="wrap">
      <div
        class="frame"
        [class.dragging]="isDragging()"
        [class.uploading]="isUploading()"
        (click)="!isUploading() && fileInput.click()"
        (dragenter)="onDragEnter($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        role="button"
        tabindex="0"
        [attr.aria-label]="previewUrl() ? 'Cambiar poster' : 'Subir poster'"
      >
        @if (previewUrl(); as url) {
          <img class="frame-img" [src]="url" alt="Poster" />
          @if (!isUploading()) {
            <button
              type="button"
              class="remove-btn"
              (click)="onRemove($event)"
              aria-label="Eliminar poster"
              title="Quitar poster"
            >
              <svg lucideTrash2 [size]="14"></svg>
            </button>
          }
        } @else {
          <div class="frame-empty">
            <svg lucideImageUp [size]="32"></svg>
            <div class="frame-title">Arrastra el poster aquí</div>
            <div class="frame-sub">o haz clic para elegir</div>
          </div>
        }

        @if (isUploading()) {
          <div class="progress">
            <span>Subiendo… {{ progress() }}%</span>
            <div class="progress-bar">
              <div class="progress-bar-fill" [style.width.%]="progress()"></div>
            </div>
          </div>
        }
      </div>

      <div class="config">
        <div class="config-title">Poster de la película</div>
        <p class="config-sub">
          Recomendado en orientación vertical (2:3). Aparece en cartelera, búsqueda y carruseles.
        </p>

        <div class="specs">
          <span class="spec">
            <svg lucideFile [size]="11"></svg>
            JPG, PNG o WebP
          </span>
          <span class="spec">
            <svg lucideRuler [size]="11"></svg>
            Máx. {{ maxSizeMb }} MB
          </span>
          <span class="spec">
            <svg lucideRuler [size]="11"></svg>
            Mín. 600×900 px sugerido
          </span>
        </div>

        <div class="actions">
          <button
            type="button"
            class="btn-ghost"
            (click)="fileInput.click()"
            [disabled]="isUploading()"
          >
            <svg lucideUpload [size]="14"></svg>
            {{ previewUrl() ? 'Reemplazar' : 'Elegir archivo' }}
          </button>
          @if (previewUrl() && !isUploading()) {
            <button type="button" class="btn-ghost" (click)="onRemove($event)">
              <svg lucideTrash2 [size]="14"></svg>
              Quitar
            </button>
          }
        </div>

        @if (errorMsg(); as msg) {
          <div class="err">
            <svg lucideTriangleAlert [size]="12"></svg>
            <span>{{ msg }}</span>
          </div>
        }
      </div>

      <input
        #fileInput
        type="file"
        [accept]="acceptedTypes"
        (change)="onFileChange($event)"
      />
    </div>
  `,
  styleUrl: './poster-upload.component.scss',
})
export class PosterUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() set posterUrl(value: string | null) {
    this.previewUrl.set(value);
  }

  @Output() posterChange = new EventEmitter<string | null>();

  readonly previewUrl = signal<string | null>(null);
  readonly isDragging = signal(false);
  readonly isUploading = signal(false);
  readonly progress = signal(0);
  readonly errorMsg = signal<string | null>(null);

  readonly maxSizeMb = MAX_SIZE_MB;
  readonly acceptedTypes = ACCEPTED_TYPES.join(',');

  private dragCounter = 0;

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    this.dragCounter++;
    this.isDragging.set(true);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.dragCounter = 0;
      this.isDragging.set(false);
    }
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragCounter = 0;
    this.isDragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  onRemove(e: Event) {
    e.stopPropagation();
    this.previewUrl.set(null);
    this.errorMsg.set(null);
    this.posterChange.emit(null);
  }

  private handleFile(file: File) {
    this.errorMsg.set(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.errorMsg.set('Formato no admitido. Usa JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.errorMsg.set(`Archivo muy grande. Máximo ${MAX_SIZE_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.simulateUpload(dataUrl);
    };
    reader.onerror = () => this.errorMsg.set('No se pudo leer el archivo');
    reader.readAsDataURL(file);
  }

  private simulateUpload(dataUrl: string) {
    this.isUploading.set(true);
    this.progress.set(0);
    this.previewUrl.set(dataUrl);

    const tick = () => {
      const next = Math.min(this.progress() + 12 + Math.floor(Math.random() * 18), 100);
      this.progress.set(next);
      if (next < 100) {
        setTimeout(tick, 120);
      } else {
        setTimeout(() => {
          this.isUploading.set(false);
          this.posterChange.emit(dataUrl);
        }, 220);
      }
    };
    setTimeout(tick, 140);
  }
}
