import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideKeyRound,
  LucidePower,
  LucidePowerOff,
  LucideX,
  LucideUsers,
  LucideTriangleAlert,
  LucideUserRound,
} from '@lucide/angular';

import {
  UsuarioStaff,
  UsuariosService,
} from '../../../shared/services/usuarios.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../shared/utils/http-errors';

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; usuario: UsuarioStaff };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-admin-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideKeyRound,
    LucidePower,
    LucidePowerOff,
    LucideX,
    LucideUsers,
    LucideTriangleAlert,
    LucideUserRound,
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
              <span class="crumb-current">Administradores</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Administradores</h1>
                <p class="lead">
                  Gestiona el staff y sus accesos.
                </p>
              </div>
              <button class="btn btn-primary" (click)="openCreate()">
                <svg lucidePlus [size]="16"></svg>
                <span>Nuevo usuario</span>
              </button>
            </div>
          </header>

          <section class="toolbar">
            <label class="search">
              <svg lucideSearch [size]="16"></svg>
              <input
                class="search-input"
                type="text"
                placeholder="Buscar por nombre o email…"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
              />
            </label>
            <span class="result-count tnum">
              {{ filtered().length }} de {{ usuarios().length }}
            </span>
          </section>

          <section class="card">
            @if (usuariosError()) {
              <div class="error-banner" role="alert">
                <span>{{ usuariosError() }}</span>
                <button type="button" class="btn btn-sm" (click)="retryUsuarios()">Reintentar</button>
              </div>
            } @else if (loadingUsuarios() && usuarios().length === 0) {
              <div class="skeleton-list">
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="skeleton-row"></div>
                }
              </div>
            } @else if (filtered().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideUserRound [size]="22"></svg>
                </span>
                <h3>Sin resultados</h3>
                <p>Nada coincide con los filtros actuales.</p>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Último acceso</th>
                      <th>Estado</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (u of filtered(); track u.id) {
                      <tr [class.is-inactive]="!u.activo">
                        <td>
                          <div class="user-cell">
                            <span class="avatar">{{ initials(u.nombre) }}</span>
                            <div>
                              <div class="nombre">{{ u.nombre }}</div>
                              <div class="email">{{ u.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="muted tnum">{{ fmtAcceso(u.ultimoAcceso) }}</td>
                        <td>
                          <span
                            class="estado-badge"
                            [class.activo]="u.activo"
                            [class.inactivo]="!u.activo"
                          >
                            {{ u.activo ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>
                        <td class="col-acc">
                          <div class="row-acc">
                            <button
                              class="icon-btn"
                              (click)="openEdit(u)"
                              title="Editar"
                              aria-label="Editar usuario"
                            >
                              <svg lucidePencil [size]="15"></svg>
                            </button>
                            <button
                              class="icon-btn"
                              (click)="resetPassword(u)"
                              title="Resetear contraseña"
                              aria-label="Resetear contraseña"
                            >
                              <svg lucideKeyRound [size]="15"></svg>
                            </button>
                            <button
                              class="icon-btn"
                              [class.danger]="u.activo"
                              (click)="toggle(u)"
                              [title]="u.activo ? 'Desactivar' : 'Activar'"
                            >
                              @if (u.activo) {
                                <svg lucidePower [size]="15"></svg>
                              } @else {
                                <svg lucidePowerOff [size]="15"></svg>
                              }
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

    <!-- Crear / editar -->
    @if (modal().kind !== 'closed') {
      <div class="overlay" (click)="closeModal()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>{{ modal().kind === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}</h2>
            <button class="icon-btn" (click)="closeModal()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <div class="field">
              <label for="u-nombre">Nombre completo</label>
              <input
                id="u-nombre"
                class="input"
                type="text"
                maxlength="60"
                placeholder="Ej. Ana López"
                [ngModel]="formNombre()"
                (ngModelChange)="formNombre.set($event)"
                autocomplete="off"
              />
            </div>
            <div class="field mt">
              <label for="u-email">Email</label>
              <input
                id="u-email"
                class="input"
                type="email"
                placeholder="usuario@cinetario.com"
                [ngModel]="formEmail()"
                (ngModelChange)="formEmail.set($event)"
                autocomplete="off"
              />
            </div>
            <div class="info-row mt">
              <svg lucideUsers [size]="15"></svg>
              <span>Los administradores tienen acceso a <strong>todos los cines</strong>.</span>
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
            <button class="btn btn-primary" [disabled]="!canSubmit()" (click)="submitModal()">
              {{ modal().kind === 'create' ? 'Crear usuario' : 'Guardar cambios' }}
            </button>
          </footer>
        </div>
      </div>
    }

    <!-- Resultado reset password -->
    @if (resetResult(); as res) {
      <div class="overlay" (click)="resetResult.set(null)">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Contraseña temporal</h2>
            <button class="icon-btn" (click)="resetResult.set(null)" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <p class="confirm-text">
              Se generó una contraseña temporal para
              <strong>{{ res.nombre }}</strong>. Compártela de forma segura; se
              le pedirá cambiarla al ingresar.
            </p>
            <div class="pwd-box">
              <code>{{ res.pwd }}</code>
              <button class="btn btn-sm" (click)="copyPwd(res.pwd)">Copiar</button>
            </div>
          </div>
          <footer class="dlg-foot">
            <button class="btn btn-primary" (click)="resetResult.set(null)">Entendido</button>
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
  styleUrl: './usuarios-roles.component.scss',
})
export class AdminUsuariosRolesComponent {
  private svc = inject(UsuariosService);

  readonly usuarios = signal<UsuarioStaff[]>([]);
  readonly loadingUsuarios = signal(false);
  readonly usuariosError = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly modal = signal<ModalMode>({ kind: 'closed' });
  readonly modalError = signal<string | null>(null);
  readonly formNombre = signal('');
  readonly formEmail = signal('');

  readonly resetResult = signal<{ nombre: string; pwd: string } | null>(null);
  readonly toast = signal<Toast>(null);

  readonly filtered = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    return this.usuarios().filter((u) => {
      if (!q) return true;
      return (
        u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  });

  readonly canSubmit = computed(() => {
    if (!this.formNombre().trim()) return false;
    if (!EMAIL_RE.test(this.formEmail().trim())) return false;
    return true;
  });

  constructor() {
    this.refresh();
  }

  initials(nombre: string): string {
    return nombre
      .split(' ')
      .filter((p) => p.length)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  fmtAcceso(iso: string | null): string {
    if (!iso) return 'Nunca';
    return new Date(iso).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ── crear / editar ──

  openCreate() {
    this.formNombre.set('');
    this.formEmail.set('');
    this.modalError.set(null);
    this.modal.set({ kind: 'create' });
  }

  openEdit(u: UsuarioStaff) {
    this.formNombre.set(u.nombre);
    this.formEmail.set(u.email);
    this.modalError.set(null);
    this.modal.set({ kind: 'edit', usuario: u });
  }

  closeModal() {
    this.modal.set({ kind: 'closed' });
    this.modalError.set(null);
  }

  submitModal() {
    if (!this.canSubmit()) return;
    const nombre = this.formNombre().trim();
    const email = this.formEmail().trim();
    const mode = this.modal();

    if (mode.kind === 'create') {
      this.svc.create({ nombre, email }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `${nombre} creado`);
        },
        error: (e) => this.modalError.set(extractMessage(e)),
      });
    } else if (mode.kind === 'edit') {
      this.svc.update(mode.usuario.id, { nombre, email }).subscribe({
        next: () => {
          this.refresh();
          this.closeModal();
          this.showToast('ok', `${nombre} actualizado`);
        },
        error: (e) => this.modalError.set(extractMessage(e)),
      });
    }
  }

  // ── acciones de fila ──

  toggle(u: UsuarioStaff) {
    this.svc.setActivo(u.id, !u.activo).subscribe({
      next: () => {
        this.refresh();
        this.showToast('ok', `${u.nombre} ${u.activo ? 'desactivado' : 'activado'}`);
      },
      error: (e) => this.showToast('err', extractMessage(e)),
    });
  }

  resetPassword(u: UsuarioStaff) {
    this.svc.resetPassword(u.id).subscribe({
      next: (res) => this.resetResult.set({ nombre: u.nombre, pwd: res.tempPassword }),
      error: (e) => this.showToast('err', extractMessage(e)),
    });
  }

  copyPwd(pwd: string) {
    navigator.clipboard?.writeText(pwd).then(
      () => this.showToast('ok', 'Contraseña copiada'),
      () => this.showToast('err', 'No se pudo copiar'),
    );
  }

  private refresh() {
    this.loadingUsuarios.set(true);
    this.usuariosError.set(null);
    this.svc.list().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loadingUsuarios.set(false);
      },
      error: (err) => {
        this.usuariosError.set(extractMessage(err));
        this.loadingUsuarios.set(false);
      },
    });
  }

  retryUsuarios(): void {
    this.refresh();
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
