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
  LucideTags,
  LucideTriangleAlert,
} from '@lucide/angular';

import {
  Genero,
  GenerosService,
} from '../../../shared/services/generos.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../shared/services/peliculas.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; genero: Genero };
type DeleteState =
  | { kind: 'idle' }
  | { kind: 'confirm'; genero: Genero };

@Component({
  selector: 'app-admin-generos',
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
    LucideTags,
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
              <span class="crumb-current">Géneros</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Géneros</h1>
                <p class="lead">
                  {{ generos().length }} géneros · {{ peliculas().length }} películas catalogadas
                </p>
              </div>
              <button class="btn btn-primary" (click)="openCreate()">
                <svg lucidePlus [size]="16"></svg>
                <span>Nuevo género</span>
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
              {{ filtered().length }} de {{ generos().length }}
            </span>
          </section>

          <section class="card">
            @if (filtered().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideTags [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                @if (searchTerm()) {
                  <p>Nada coincide con <strong>"{{ searchTerm() }}"</strong>.</p>
                } @else {
                  <p>Aún no hay géneros registrados.</p>
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
                      <th class="col-nombre">Género</th>
                      <th class="col-cines">Películas</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (g of filtered(); track g.id) {
                      <tr>
                        <td class="col-nombre">
                          <span class="nombre">{{ g.nombre }}</span>
                        </td>
                        <td class="col-cines tnum">
                          @let n = peliculasPorGenero()[g.id];
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
                              (click)="openEdit(g)"
                              title="Editar"
                              aria-label="Editar género"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </button>
                            <button
                              class="icon-btn danger"
                              (click)="askDelete(g)"
                              title="Eliminar"
                              aria-label="Eliminar género"
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
              {{ modal().kind === 'create' ? 'Nuevo género' : 'Editar género' }}
            </h2>
            <button class="icon-btn" (click)="closeModal()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>

          <div class="dlg-body">
            <div class="field">
              <label for="genero-nombre">Nombre</label>
              <input
                id="genero-nombre"
                class="input"
                type="text"
                maxlength="60"
                placeholder="Ej. Documental"
                [ngModel]="formNombre()"
                (ngModelChange)="formNombre.set($event)"
                (keyup.enter)="submitModal()"
                autocomplete="off"
              />
              <span class="help">Único en el sistema. Se usa al clasificar películas.</span>
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
              {{ modal().kind === 'create' ? 'Crear género' : 'Guardar cambios' }}
            </button>
          </footer>
        </div>
      </div>
    }

    @if (deleteTarget(); as target) {
      <div class="overlay" (click)="cancelDelete()">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Eliminar género</h2>
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
                  Este género está usado en {{ deleteAssocCount() }}
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
  styleUrl: './generos.component.scss',
})
export class AdminGenerosComponent {
  private generosSvc = inject(GenerosService);
  private peliculasSvc = inject(PeliculasService);

  readonly generos = signal<Genero[]>([]);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly searchTerm = signal('');
  readonly formNombre = signal('');
  readonly modal = signal<ModalMode>({ kind: 'closed' });
  readonly deleteState = signal<DeleteState>({ kind: 'idle' });
  readonly modalError = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    if (!t) return this.generos();
    return this.generos().filter((g) => g.nombre.toLowerCase().includes(t));
  });

  readonly peliculasPorGenero = computed(() => {
    const map: Record<string, number> = {};
    for (const p of this.peliculas()) {
      for (const gid of p.id_generos) {
        map[gid] = (map[gid] ?? 0) + 1;
      }
    }
    return map;
  });

  readonly deleteTarget = computed(() => {
    const s = this.deleteState();
    return s.kind === 'confirm' ? s.genero : null;
  });

  readonly deleteAssocCount = computed(() => {
    const target = this.deleteTarget();
    if (!target) return 0;
    return this.peliculasPorGenero()[target.id] ?? 0;
  });

  readonly canSubmit = computed(() => {
    const name = this.formNombre().trim();
    if (!name) return false;
    const mode = this.modal();
    if (mode.kind === 'edit' && name === mode.genero.nombre) return false;
    return true;
  });

  constructor() {
    this.refresh();
    this.peliculasSvc.list().subscribe((p) => this.peliculas.set(p));
  }

  openCreate() {
    this.formNombre.set('');
    this.modalError.set(null);
    this.modal.set({ kind: 'create' });
  }

  openEdit(g: Genero) {
    this.formNombre.set(g.nombre);
    this.modalError.set(null);
    this.modal.set({ kind: 'edit', genero: g });
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
      this.generosSvc.create({ nombre }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `Género "${nombre}" creado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo crear'),
      });
    } else if (mode.kind === 'edit') {
      this.generosSvc.update(mode.genero.id, { nombre }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `"${mode.genero.nombre}" actualizado`);
        },
        error: (e) => this.modalError.set(e?.message ?? 'No se pudo guardar'),
      });
    }
  }

  askDelete(g: Genero) {
    this.deleteState.set({ kind: 'confirm', genero: g });
  }

  cancelDelete() {
    this.deleteState.set({ kind: 'idle' });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.generosSvc.delete(target.id).subscribe({
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
    this.generosSvc.list().subscribe((data) => this.generos.set(data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
