import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
  LucideX,
  LucideSofa,
  LucideTriangleAlert,
} from '@lucide/angular';

import {
  TipoAsiento,
  TiposAsientoService,
} from '../../../shared/services/tipos-asiento.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; tipo: TipoAsiento };
type DeleteState = { kind: 'idle' } | { kind: 'confirm'; tipo: TipoAsiento };

const DEFAULT_COLOR = '#a8a29e';
const HEX6_RE = /^[0-9a-fA-F]{6}$/;
const HEX3_RE = /^[0-9a-fA-F]{3}$/;

function expandHex3(s: string): string {
  return s.split('').map((c) => c + c).join('');
}

function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, '');
  if (HEX6_RE.test(trimmed)) return '#' + trimmed.toLowerCase();
  if (HEX3_RE.test(trimmed)) return '#' + expandHex3(trimmed).toLowerCase();
  return null;
}

@Component({
  selector: 'app-admin-tipos-asiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideTrash2,
    LucideX,
    LucideSofa,
    LucideTriangleAlert,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <header class="topbar">
            <div class="crumb">
              <a routerLink="/admin">Admin</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Tipos de asiento</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Tipos de asiento</h1>
                <p class="lead">
                  {{ tipos().length }} en el catálogo
                </p>
              </div>
              <button class="btn btn-primary" (click)="openCreate()">
                <svg lucidePlus [size]="16"></svg>
                <span>Nuevo tipo</span>
              </button>
            </div>
          </header>

          <section class="toolbar">
            <label class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                class="search-input"
                type="text"
                placeholder="Buscar por nombre…"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
              />
            </label>
            <span class="result-count tnum">
              {{ filtered().length }} de {{ tipos().length }}
            </span>
          </section>

          <section class="card">
            @if (filtered().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideSofa [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                @if (searchTerm()) {
                  <p>Nada coincide con <strong>"{{ searchTerm() }}"</strong>.</p>
                } @else {
                  <p>Aún no hay tipos de asiento.</p>
                  <button class="btn btn-primary btn-sm" (click)="openCreate()">
                    <svg lucidePlus [size]="14"></svg>
                    <span>Crear el primero</span>
                  </button>
                }
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th class="col-tipo">Tipo</th>
                      <th class="col-num">Salas</th>
                      <th class="col-num">Asientos</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of filtered(); track t.id) {
                      <tr>
                        <td class="col-tipo">
                          <div class="tipo-cell">
                            <span class="swatch" [style.background]="t.color ?? '#cccccc'"></span>
                            <span class="nombre">{{ t.nombre }}</span>
                          </div>
                        </td>
                        <td class="col-num">
                          <span class="tnum muted">{{ t.salas_usando ?? 0 }}</span>
                        </td>
                        <td class="col-num">
                          <span class="tnum muted">{{ t.asientos_total ?? 0 }}</span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <button
                              class="icon-btn"
                              (click)="openEdit(t)"
                              title="Editar"
                              aria-label="Editar tipo"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </button>
                            <button
                              class="icon-btn danger"
                              (click)="askDelete(t)"
                              title="Eliminar"
                              aria-label="Eliminar tipo"
                            >
                              <svg lucideTrash2 [size]="15"></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        </div>
      </main>
    </div>

    @if (modal().kind !== 'closed') {
      <div class="overlay" (click)="closeModal()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>{{ modal().kind === 'create' ? 'Nuevo tipo' : 'Editar tipo' }}</h2>
            <button class="icon-btn" (click)="closeModal()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>

          <div class="dlg-body">
            <div class="field">
              <label for="tipo-nombre">Nombre</label>
              <input
                id="tipo-nombre"
                class="input"
                type="text"
                maxlength="40"
                placeholder="Ej. Premium"
                [ngModel]="formNombre()"
                (ngModelChange)="formNombre.set($event)"
                autocomplete="off"
              />
            </div>

            <div class="field mt">
              <label for="tipo-color-hex">Color en el mapa</label>
              <div class="color-row">
                <input
                  class="color-swatch-input"
                  type="color"
                  aria-label="Selector visual de color"
                  [ngModel]="formColor()"
                  (ngModelChange)="onColorPicker($event)"
                />
                <span class="color-hash" aria-hidden="true">#</span>
                <input
                  id="tipo-color-hex"
                  class="color-hex-input"
                  type="text"
                  inputmode="text"
                  spellcheck="false"
                  autocomplete="off"
                  maxlength="6"
                  placeholder="A8A29E"
                  aria-describedby="color-hex-hint"
                  [ngModel]="hexInput()"
                  (ngModelChange)="onHexInput($event)"
                  (blur)="commitHexInput()"
                />
              </div>
              <div id="color-hex-hint" class="color-hint">
                Tipeá el código hex (3 o 6 caracteres) o usá el selector.
              </div>
              @if (presetColors().length > 0) {
                <div class="color-presets" role="listbox" aria-label="Colores recientes del catálogo">
                  @for (preset of presetColors(); track preset) {
                    <button
                      type="button"
                      role="option"
                      class="preset"
                      [class.active]="formColor().toLowerCase() === preset.toLowerCase()"
                      [attr.aria-selected]="formColor().toLowerCase() === preset.toLowerCase()"
                      [style.background]="preset"
                      [title]="preset.toUpperCase()"
                      (click)="applyPreset(preset)"
                    ></button>
                  }
                </div>
              }
            </div>

            <div class="preview-row mt">
              <span class="swatch" [style.background]="formColor()"></span>
              <span class="preview-name">{{ formNombre().trim() || 'Nuevo tipo' }}</span>
            </div>

            @if (modalError()) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>{{ modalError() }}</span>
              </div>
            }
          </div>

          <footer class="dlg-foot">
            <button class="btn" (click)="closeModal()">Cancelar</button>
            <button
              class="btn btn-primary"
              [disabled]="!canSubmit()"
              (click)="submitModal()"
            >
              {{ modal().kind === 'create' ? 'Crear tipo' : 'Guardar cambios' }}
            </button>
          </footer>
        </div>
      </div>
    }

    @if (deleteTarget(); as target) {
      <div class="overlay" (click)="cancelDelete()">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Eliminar tipo</h2>
            <button class="icon-btn" (click)="cancelDelete()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <p class="confirm-text">
              ¿Eliminar <strong>{{ target.nombre }}</strong>? Esta acción no se puede deshacer.
            </p>
            @if ((target.asientos_total ?? 0) > 0) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>
                  Está asignado a {{ target.asientos_total ?? 0 }} asientos en
                  {{ target.salas_usando ?? 0 }}
                  {{ (target.salas_usando ?? 0) === 1 ? 'sala' : 'salas' }}.
                  Reasígnalos primero.
                </span>
              </div>
            }
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="cancelDelete()">Cancelar</button>
            <button
              class="btn btn-danger"
              [disabled]="(target.asientos_total ?? 0) > 0"
              (click)="confirmDelete()"
            >
              Eliminar
            </button>
          </footer>
        </div>
      </div>
    }

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './tipos-asiento.component.scss',
})
export class AdminTiposAsientoComponent {
  private svc = inject(TiposAsientoService);

  readonly tipos = signal<TipoAsiento[]>([]);
  readonly searchTerm = signal('');

  readonly formNombre = signal('');
  readonly formColor = signal(DEFAULT_COLOR);
  readonly hexInput = signal(DEFAULT_COLOR.replace(/^#/, '').toUpperCase());

  readonly modal = signal<ModalMode>({ kind: 'closed' });
  readonly deleteState = signal<DeleteState>({ kind: 'idle' });
  readonly modalError = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    if (!t) return this.tipos();
    return this.tipos().filter((x) => x.nombre.toLowerCase().includes(t));
  });

  readonly deleteTarget = computed(() => {
    const s = this.deleteState();
    return s.kind === 'confirm' ? s.tipo : null;
  });

  readonly presetColors = computed<string[]>(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of this.tipos()) {
      const c = t.color?.toLowerCase();
      if (c && !seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
    return out.slice(0, 8);
  });

  readonly canSubmit = computed(() => {
    const name = this.formNombre().trim();
    if (!name) return false;
    const mode = this.modal();
    if (mode.kind === 'edit') {
      const t = mode.tipo;
      const sameColor =
        (t.color ?? '').toLowerCase() === this.formColor().toLowerCase();
      const unchanged = name === t.nombre && sameColor;
      if (unchanged) return false;
    }
    return true;
  });

  constructor() {
    this.refresh();
  }

  openCreate() {
    this.formNombre.set('');
    this.setColor(DEFAULT_COLOR);
    this.modalError.set(null);
    this.modal.set({ kind: 'create' });
  }

  openEdit(t: TipoAsiento) {
    this.formNombre.set(t.nombre);
    this.setColor(t.color ?? DEFAULT_COLOR);
    this.modalError.set(null);
    this.modal.set({ kind: 'edit', tipo: t });
  }

  closeModal() {
    this.modal.set({ kind: 'closed' });
    this.modalError.set(null);
  }

  onColorPicker(value: string) {
    this.setColor(value);
  }

  onHexInput(raw: string) {
    const cleaned = (raw ?? '').replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    this.hexInput.set(cleaned.toUpperCase());
    const normalized = normalizeHex(cleaned);
    if (normalized) {
      this.formColor.set(normalized);
    }
  }

  commitHexInput() {
    const normalized = normalizeHex(this.hexInput());
    if (normalized) {
      this.setColor(normalized);
    } else {
      this.hexInput.set(this.formColor().replace(/^#/, '').toUpperCase());
    }
  }

  applyPreset(hex: string) {
    this.setColor(hex);
  }

  private setColor(hex: string) {
    const normalized = normalizeHex(hex) ?? DEFAULT_COLOR;
    this.formColor.set(normalized);
    this.hexInput.set(normalized.replace(/^#/, '').toUpperCase());
  }

  submitModal() {
    if (!this.canSubmit()) return;
    const payload = {
      nombre: this.formNombre().trim(),
      color: this.formColor(),
    };
    const mode = this.modal();

    if (mode.kind === 'create') {
      this.svc.create(payload).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `"${payload.nombre}" creado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo crear'),
      });
    } else if (mode.kind === 'edit') {
      this.svc.update(mode.tipo.id, payload).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `"${payload.nombre}" actualizado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo guardar'),
      });
    }
  }

  askDelete(t: TipoAsiento) {
    this.deleteState.set({ kind: 'confirm', tipo: t });
  }

  cancelDelete() {
    this.deleteState.set({ kind: 'idle' });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.svc.remove(target.id).subscribe({
      next: () => {
        this.refresh();
        this.deleteState.set({ kind: 'idle' });
        this.showToast('ok', `"${target.nombre}" eliminado`);
      },
      error: (e) => {
        this.deleteState.set({ kind: 'idle' });
        this.showToast('err', e?.message ?? 'No se pudo eliminar');
      },
    });
  }

  private refresh() {
    this.svc.list().subscribe((data) => this.tipos.set(data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
