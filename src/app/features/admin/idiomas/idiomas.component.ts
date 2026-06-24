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
  LucideLanguages,
  LucideTriangleAlert,
} from '@lucide/angular';

import {
  Idioma,
  IdiomasService,
} from '../../../shared/services/idiomas.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../shared/services/peliculas.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; idioma: Idioma };
type DeleteState =
  | { kind: 'idle' }
  | { kind: 'confirm'; idioma: Idioma };

@Component({
  selector: 'app-admin-idiomas',
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
    LucideLanguages,
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
              <span class="crumb-current">Idiomas</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Idiomas</h1>
                <p class="lead">
                  {{ idiomas().length }} idiomas · {{ peliculas().length }} películas catalogadas
                </p>
              </div>
              <button class="btn btn-primary" (click)="openCreate()">
                <svg lucidePlus [size]="16"></svg>
                <span>Nuevo idioma</span>
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
              {{ filtered().length }} de {{ idiomas().length }}
            </span>
          </section>

          <section class="card">
            @if (filtered().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideLanguages [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                @if (searchTerm()) {
                  <p>Nada coincide con <strong>"{{ searchTerm() }}"</strong>.</p>
                } @else {
                  <p>Aún no hay idiomas registrados.</p>
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
                      <th class="col-nombre">Idioma</th>
                      <th class="col-cines">Películas</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (i of filtered(); track i.id) {
                      <tr>
                        <td class="col-nombre">
                          <span class="nombre">{{ i.nombre }}</span>
                        </td>
                        <td class="col-cines tnum">
                          @let n = peliculasPorIdioma()[i.id];
                          @if (!n) {
                            <span class="pill">sin películas</span>
                          } @else {
                            <span class="pill red-soft">
                              {{ n }} {{ n === 1 ? 'película' : 'películas' }}
                            </span>
                          }
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <button
                              class="icon-btn"
                              (click)="openEdit(i)"
                              title="Editar"
                              aria-label="Editar idioma"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </button>
                            <button
                              class="icon-btn danger"
                              (click)="askDelete(i)"
                              title="Eliminar"
                              aria-label="Eliminar idioma"
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
            <h2>
              {{ modal().kind === 'create' ? 'Nuevo idioma' : 'Editar idioma' }}
            </h2>
            <button class="icon-btn" (click)="closeModal()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>

          <div class="dlg-body">
            <div class="field">
              <label for="idioma-nombre">Nombre</label>
              <input
                id="idioma-nombre"
                class="input"
                type="text"
                maxlength="60"
                placeholder="Ej. Portugués (sub)"
                [ngModel]="formNombre()"
                (ngModelChange)="formNombre.set($event)"
                (keyup.enter)="submitModal()"
                autocomplete="off"
              />
              <span class="help">Único en el sistema. Se usa para clasificar películas (subtitulado / doblaje).</span>
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
              {{ modal().kind === 'create' ? 'Crear idioma' : 'Guardar cambios' }}
            </button>
          </footer>
        </div>
      </div>
    }

    @if (deleteTarget(); as target) {
      <div class="overlay" (click)="cancelDelete()">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Eliminar idioma</h2>
            <button class="icon-btn" (click)="cancelDelete()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <p class="confirm-text">
              ¿Eliminar <strong>{{ target.nombre }}</strong>? Esta acción no se puede deshacer.
            </p>
            @if (deleteAssocCount() > 0) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>
                  Este idioma está usado en {{ deleteAssocCount() }}
                  {{ deleteAssocCount() === 1 ? 'película' : 'películas' }}.
                  Reasígnalas primero.
                </span>
              </div>
            }
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="cancelDelete()">Cancelar</button>
            <button
              class="btn btn-danger"
              [disabled]="deleteAssocCount() > 0"
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
  styleUrl: './idiomas.component.scss',
})
export class AdminIdiomasComponent {
  private idiomasSvc = inject(IdiomasService);
  private peliculasSvc = inject(PeliculasService);

  readonly idiomas = signal<Idioma[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly searchTerm = signal('');
  readonly formNombre = signal('');
  readonly formCodigo = signal('');
  readonly modal = signal<ModalMode>({ kind: 'closed' });
  readonly deleteState = signal<DeleteState>({ kind: 'idle' });
  readonly modalError = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    if (!t) return this.idiomas();
    return this.idiomas().filter(
      (i) => i.nombre.toLowerCase().includes(t),
    );
  });

  readonly peliculasPorIdioma = computed(() => {
    const map: Record<string, number> = {};
    for (const p of this.peliculas()) {
      if (!p.id_idioma) continue;
      map[p.id_idioma] = (map[p.id_idioma] ?? 0) + 1;
    }
    return map;
  });

  readonly deleteTarget = computed(() => {
    const s = this.deleteState();
    return s.kind === 'confirm' ? s.idioma : null;
  });

  readonly deleteAssocCount = computed(() => {
    const target = this.deleteTarget();
    if (!target) return 0;
    return this.peliculasPorIdioma()[target.id] ?? 0;
  });

  readonly canSubmit = computed(() => {
    const nombre = this.formNombre().trim();
    if (!nombre) return false;
    const mode = this.modal();
    if (mode.kind === 'edit' && nombre === mode.idioma.nombre) {
      return false;
    }
    return true;
  });

  constructor() {
    this.refresh();
    this.peliculasSvc.list().subscribe((p) => this.peliculas.set(p.data));
  }

  openCreate() {
    this.formNombre.set('');
    this.formCodigo.set('');
    this.modalError.set(null);
    this.modal.set({ kind: 'create' });
  }

  openEdit(i: Idioma) {
    this.formNombre.set(i.nombre);
    this.formCodigo.set('');
    this.modalError.set(null);
    this.modal.set({ kind: 'edit', idioma: i });
  }

  closeModal() {
    this.modal.set({ kind: 'closed' });
    this.modalError.set(null);
  }

  submitModal() {
    if (!this.canSubmit()) return;
    const nombre = this.formNombre().trim();
    const mode = this.modal();

    if (mode.kind === 'create') {
      this.idiomasSvc.create({ nombre }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `Idioma "${nombre}" creado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo crear'),
      });
    } else if (mode.kind === 'edit') {
      this.idiomasSvc.update(mode.idioma.id, { nombre }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `"${mode.idioma.nombre}" actualizado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo guardar'),
      });
    }
  }

  askDelete(i: Idioma) {
    this.deleteState.set({ kind: 'confirm', idioma: i });
  }

  cancelDelete() {
    this.deleteState.set({ kind: 'idle' });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.idiomasSvc.delete(target.id).subscribe({
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
    this.idiomasSvc.list().subscribe((data) => this.idiomas.set(data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
