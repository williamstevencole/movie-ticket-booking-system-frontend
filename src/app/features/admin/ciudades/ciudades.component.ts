import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
  LucideX,
  LucideMapPin,
  LucideTriangleAlert,
  LucideRefreshCw,
} from '@lucide/angular';

import {
  Ciudad,
  CiudadesService,
} from '../../../shared/services/ciudades.service';
import { CinesService, Cine } from '../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../shared/utils/http-errors';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; ciudad: Ciudad };
type DeleteState =
  | { kind: 'idle' }
  | { kind: 'confirm'; ciudad: Ciudad };

@Component({
  selector: 'app-admin-ciudades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    AdminSidebarComponent,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideTrash2,
    LucideX,
    LucideMapPin,
    LucideTriangleAlert,
    LucideRefreshCw,
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
          <span class="crumb-current">Ciudades</span>
        </div>
        <div class="head-row">
          <div>
            <h1>Ciudades</h1>
            <p class="lead">
              {{ ciudades().length }} ciudades · {{ totalCines() }} cines en operación
            </p>
          </div>
          <button class="btn btn-primary" (click)="openCreate()">
            <svg lucidePlus [size]="16"></svg>
            <span>Nueva ciudad</span>
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
          {{ filtered().length }} de {{ ciudades().length }}
        </span>
      </section>

      @if (error(); as msg) {
        <section class="error-banner" role="alert">
          <span>{{ msg }}</span>
          <button class="btn btn-ghost" (click)="reload()">
            <svg lucideRefreshCw [size]="14"></svg>
            Reintentar
          </button>
        </section>
      }

      <section class="card">
        @if (loading() && ciudades().length === 0) {
          <div class="table-scroll">
            <table class="tbl">
              <thead>
                <tr>
                  <th class="col-nombre">Ciudad</th>
                  <th class="col-cines">Cines</th>
                  <th class="col-fecha">Registrada</th>
                  <th class="col-acc" aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                @for (_ of skeletonRows; track $index) {
                  <tr class="row-skeleton">
                    <td colspan="4"><span class="skeleton-bar"></span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (filtered().length === 0) {
          <div class="empty">
            <span class="empty-mark">
              <svg lucideMapPin [size]="22"></svg>
            </span>
            <h3>Sin resultados</h3>
            @if (searchTerm()) {
              <p>Nada coincide con <strong>"{{ searchTerm() }}"</strong>.</p>
            } @else {
              <p>Aún no hay ciudades registradas.</p>
              <button class="btn btn-primary btn-sm" (click)="openCreate()">
                <svg lucidePlus [size]="14"></svg>
                <span>Crear la primera</span>
              </button>
            }
          </div>
        } @else {
          <div class="table-scroll">
            <table class="tbl">
              <thead>
                <tr>
                  <th class="col-nombre">Ciudad</th>
                  <th class="col-cines">Cines</th>
                  <th class="col-fecha">Registrada</th>
                  <th class="col-acc" aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                @for (c of filtered(); track c.id) {
                  <tr>
                    <td class="col-nombre">
                      <span class="nombre">{{ c.nombre }}</span>
                    </td>
                    <td class="col-cines tnum">
                      @let n = cinesPorCiudad()[c.id];
                      @if (!n) {
                        <span class="pill">sin cines</span>
                      } @else {
                        <span class="pill red-soft">
                          {{ n }} {{ n === 1 ? 'cine' : 'cines' }}
                        </span>
                      }
                    </td>
                    <td class="col-fecha tnum">
                      {{ c.created_at | date: 'd MMM y' }}
                    </td>
                    <td class="col-acc">
                      <div class="row-acc">
                        <button
                          class="icon-btn"
                          (click)="openEdit(c)"
                          title="Editar"
                          aria-label="Editar ciudad"
                        >
                          <svg lucidePencil [size]="15"></svg>
                        </button>
                        <button
                          class="icon-btn danger"
                          (click)="askDelete(c)"
                          title="Eliminar"
                          aria-label="Eliminar ciudad"
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
              {{ modal().kind === 'create' ? 'Nueva ciudad' : 'Editar ciudad' }}
            </h2>
            <button class="icon-btn" (click)="closeModal()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>

          <div class="dlg-body">
            <div class="field">
              <label for="ciudad-nombre">Nombre</label>
              <input
                id="ciudad-nombre"
                class="input"
                type="text"
                placeholder="Ej. Tegucigalpa"
                [ngModel]="formNombre()"
                (ngModelChange)="formNombre.set($event)"
                (keyup.enter)="submitModal()"
                autocomplete="off"
              />
              <span class="help">Único en el sistema. Se usa al asociar cines y funciones.</span>
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
              {{ modal().kind === 'create' ? 'Crear ciudad' : 'Guardar cambios' }}
            </button>
          </footer>
        </div>
      </div>
    }

    @if (deleteTarget(); as target) {
      <div class="overlay" (click)="cancelDelete()">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Eliminar ciudad</h2>
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
                  Esta ciudad tiene {{ deleteAssocCount() }}
                  {{ deleteAssocCount() === 1 ? 'cine asociado' : 'cines asociados' }}.
                  Reubícalos primero.
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
  styleUrl: './ciudades.component.scss',
})
export class AdminCiudadesComponent {
  private ciudadesSvc = inject(CiudadesService);
  private cinesSvc = inject(CinesService);

  readonly ciudades = signal<Ciudad[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly searchTerm = signal('');
  readonly formNombre = signal('');
  readonly modal = signal<ModalMode>({ kind: 'closed' });
  readonly deleteState = signal<DeleteState>({ kind: 'idle' });
  readonly modalError = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly skeletonRows = Array.from({ length: 6 });

  readonly filtered = computed(() => {
    const t = this.searchTerm().trim().toLowerCase();
    if (!t) return this.ciudades();
    return this.ciudades().filter((c) => c.nombre.toLowerCase().includes(t));
  });

  readonly cinesPorCiudad = computed(() => {
    const map: Record<string, number> = {};
    for (const c of this.cines()) {
      map[c.id_ciudad] = (map[c.id_ciudad] ?? 0) + 1;
    }
    return map;
  });

  readonly totalCines = computed(() => this.cines().length);

  readonly deleteTarget = computed(() => {
    const s = this.deleteState();
    return s.kind === 'confirm' ? s.ciudad : null;
  });

  readonly deleteAssocCount = computed(() => {
    const target = this.deleteTarget();
    if (!target) return 0;
    return this.cinesPorCiudad()[target.id] ?? 0;
  });

  readonly canSubmit = computed(() => {
    const name = this.formNombre().trim();
    if (!name) return false;
    const mode = this.modal();
    if (mode.kind === 'edit' && name === mode.ciudad.nombre) return false;
    return true;
  });

  constructor() {
    this.fetchCiudades();
    this.cinesSvc.list().subscribe((page) => this.cines.set(page.data));
  }

  openCreate() {
    this.formNombre.set('');
    this.modalError.set(null);
    this.modal.set({ kind: 'create' });
  }

  openEdit(c: Ciudad) {
    this.formNombre.set(c.nombre);
    this.modalError.set(null);
    this.modal.set({ kind: 'edit', ciudad: c });
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
      this.ciudadesSvc.create({ nombre }).subscribe({
        next: () => {
          this.fetchCiudades();
          this.closeModal();
          this.showToast('ok', `Ciudad "${nombre}" creada`);
        },
        error: (err) => this.modalError.set(extractMessage(err)),
      });
    } else if (mode.kind === 'edit') {
      this.ciudadesSvc.update(mode.ciudad.id, { nombre }).subscribe({
        next: () => {
          this.fetchCiudades();
          this.closeModal();
          this.showToast('ok', `"${mode.ciudad.nombre}" actualizada`);
        },
        error: (err) => this.modalError.set(extractMessage(err)),
      });
    }
  }

  askDelete(c: Ciudad) {
    this.deleteState.set({ kind: 'confirm', ciudad: c });
  }

  cancelDelete() {
    this.deleteState.set({ kind: 'idle' });
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.ciudadesSvc.delete(target.id).subscribe({
      next: () => {
        this.fetchCiudades();
        this.deleteState.set({ kind: 'idle' });
        this.showToast('ok', `"${target.nombre}" eliminada`);
      },
      error: (err) => {
        this.deleteState.set({ kind: 'idle' });
        this.showToast('err', extractMessage(err));
      },
    });
  }

  reload(): void {
    this.fetchCiudades();
  }

  private fetchCiudades(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ciudadesSvc.list().subscribe({
      next: (data) => {
        this.ciudades.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.ciudades.set([]);
        this.error.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
