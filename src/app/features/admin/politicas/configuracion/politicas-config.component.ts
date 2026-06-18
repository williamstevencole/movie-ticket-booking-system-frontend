import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideTrash2,
  LucideSave,
  LucideChevronDown,
  LucideChevronRight,
  LucideClipboardList,
  LucideBuilding2,
} from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
import {
  PoliticaCancelacion,
  PoliticasCancelacionService,
  ReglaPolitica,
} from '../../../../shared/services/politicas-cancelacion.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

@Component({
  selector: 'app-admin-politicas-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucidePlus,
    LucideTrash2,
    LucideSave,
    LucideChevronDown,
    LucideChevronRight,
    LucideClipboardList,
    LucideBuilding2,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Políticas de cancelación</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Políticas de cancelación</h1>
              <p class="lead">Define las reglas de reembolso por cine</p>
            </div>
          </div>

          <!-- Selector de cine -->
          <section class="cine-picker">
            <label class="picker-label">Cine</label>
            <select class="picker-select" [value]="idCineSel()" (change)="onCineChange($event)">
              <option value="">— Selecciona un cine —</option>
              @for (c of cines(); track c.id) {
                <option [value]="c.id">{{ c.nombre }}</option>
              }
            </select>

            @if (idCineSel()) {
              <div class="nueva-pol">
                <input
                  type="text"
                  class="nueva-pol-input"
                  placeholder="Nombre de nueva política…"
                  [ngModel]="nuevoNombre()"
                  (ngModelChange)="nuevoNombre.set($event)"
                />
                <button
                  class="btn btn-primary btn-sm"
                  (click)="crearPolitica()"
                  [disabled]="!nuevoNombre().trim()"
                >
                  <svg lucidePlus [size]="14"></svg>
                  <span>Nueva política</span>
                </button>
              </div>
            }
          </section>

          <!-- Estado vacío -->
          @if (idCineSel() && politicas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">
                <svg lucideClipboardList [size]="24"></svg>
              </span>
              <p>Este cine aún no tiene políticas de cancelación.</p>
            </div>
          }

          @if (!idCineSel()) {
            <div class="no-cine">
              <svg lucideBuilding2 [size]="20"></svg>
              <span>Selecciona un cine para ver y configurar sus políticas.</span>
            </div>
          }

          <!-- Lista de políticas (acordeón) -->
          @for (p of politicas(); track p.id) {
            <article class="pol-card" [class.is-expanded]="expandida() === p.id">
              <header class="pol-head" (click)="toggleExpand(p.id)">
                <span class="caret">
                  @if (expandida() === p.id) {
                    <svg lucideChevronDown [size]="16"></svg>
                  } @else {
                    <svg lucideChevronRight [size]="16"></svg>
                  }
                </span>
                <input
                  class="pol-nombre"
                  [value]="p.nombre"
                  (input)="onNombreInput(p.id, $event)"
                  (click)="$event.stopPropagation()"
                />
                <label class="activa-toggle" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    [checked]="p.activa"
                    (change)="onActivaToggle(p.id, $event)"
                  />
                  <span>Activa</span>
                </label>
                @if (politicasDirty().has(p.id)) {
                  <span class="dirty-mark" title="Cambios sin guardar">●</span>
                }
              </header>

              @if (expandida() === p.id) {
                <div class="pol-body">
                  @if (reglas(p.id).length === 0) {
                    <p class="no-reglas">Sin reglas definidas. Agrega una para comenzar.</p>
                  }

                  @if (reglas(p.id).length > 0) {
                    <div class="table-scroll">
                      <table class="reglas-tbl">
                        <thead>
                          <tr>
                            <th>Horas desde</th>
                            <th>Horas hasta</th>
                            <th>% reembolso</th>
                            <th aria-label="Eliminar"></th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (r of reglas(p.id); track r.id; let i = $index) {
                            <tr>
                              <td>
                                <input
                                  type="number"
                                  class="num-input"
                                  min="0"
                                  [value]="r.horas_antes_minimo"
                                  (input)="onReglaChange(p.id, i, 'horas_antes_minimo', $event)"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  class="num-input"
                                  min="0"
                                  [value]="r.horas_antes_maximo ?? ''"
                                  placeholder="∞"
                                  (input)="onReglaChange(p.id, i, 'horas_antes_maximo', $event)"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  class="num-input"
                                  [class.invalid]="r.porcentaje_reembolso < 0 || r.porcentaje_reembolso > 100"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  [value]="r.porcentaje_reembolso"
                                  (input)="onReglaChange(p.id, i, 'porcentaje_reembolso', $event)"
                                />
                              </td>
                              <td>
                                <button
                                  class="icon-btn danger"
                                  (click)="eliminarRegla(p.id, i)"
                                  title="Eliminar regla"
                                >
                                  <svg lucideTrash2 [size]="14"></svg>
                                </button>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }

                  <div class="reglas-foot">
                    <button class="btn btn-ghost btn-sm" (click)="agregarRegla(p.id)">
                      <svg lucidePlus [size]="14"></svg>
                      <span>Agregar regla</span>
                    </button>
                    <button
                      class="btn btn-primary btn-sm"
                      [disabled]="!politicasDirty().has(p.id)"
                      (click)="guardarPolitica(p)"
                    >
                      <svg lucideSave [size]="14"></svg>
                      <span>Guardar cambios</span>
                    </button>
                  </div>

                  @if (overlapWarning(p.id)) {
                    <div class="warn">⚠ Hay rangos de horas traslapados en esta política</div>
                  }
                </div>
              }
            </article>
          }
        </div>
      </main>
    </div>

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './politicas-config.component.scss',
})
export class AdminPoliticasConfigComponent {
  private cinesSvc = inject(CinesService);
  private politicasSvc = inject(PoliticasCancelacionService);

  readonly cines = signal<Cine[]>([]);
  readonly idCineSel = signal<string>('');
  readonly politicas = signal<PoliticaCancelacion[]>([]);
  readonly reglasPorPolitica = signal<Map<string, ReglaPolitica[]>>(new Map());
  readonly expandida = signal<string | null>(null);
  readonly politicasDirty = signal<Set<string>>(new Set());
  readonly nuevoNombre = signal('');
  readonly toast = signal<{ kind: 'ok' | 'err'; text: string } | null>(null);

  constructor() {
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));
  }

  onCineChange(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    this.idCineSel.set(id);
    this.expandida.set(null);
    this.politicas.set([]);
    this.reglasPorPolitica.set(new Map());
    this.politicasDirty.set(new Set());

    if (id) {
      this.politicasSvc.listByCine(id).subscribe((list) => {
        this.politicas.set(list);
      });
    }
  }

  toggleExpand(id: string): void {
    if (this.expandida() === id) {
      this.expandida.set(null);
      return;
    }
    this.expandida.set(id);

    // Lazy-load reglas si no están en el Map
    if (!this.reglasPorPolitica().has(id)) {
      this.politicasSvc.listReglas(id).subscribe((reglas) => {
        const nextMap = new Map(this.reglasPorPolitica());
        nextMap.set(id, reglas);
        this.reglasPorPolitica.set(nextMap);
      });
    }
  }

  reglas(idPolitica: string): ReglaPolitica[] {
    return this.reglasPorPolitica().get(idPolitica) ?? [];
  }

  onReglaChange(
    idPolitica: string,
    index: number,
    field: keyof ReglaPolitica,
    e: Event,
  ): void {
    const raw = (e.target as HTMLInputElement).value;
    const currentReglas = [...(this.reglasPorPolitica().get(idPolitica) ?? [])];
    const regla = { ...currentReglas[index] };

    if (field === 'horas_antes_maximo') {
      (regla as ReglaPolitica).horas_antes_maximo =
        raw.trim() === '' ? null : parseFloat(raw);
    } else if (field === 'horas_antes_minimo' || field === 'porcentaje_reembolso') {
      (regla as ReglaPolitica)[field] = parseFloat(raw) || 0;
    }

    currentReglas[index] = regla;
    const nextMap = new Map(this.reglasPorPolitica());
    nextMap.set(idPolitica, currentReglas);
    this.reglasPorPolitica.set(nextMap);
    this.markDirty(idPolitica);
  }

  agregarRegla(idPolitica: string): void {
    const currentReglas = [...(this.reglasPorPolitica().get(idPolitica) ?? [])];
    const nueva: ReglaPolitica = {
      id: `tmp-${Date.now()}`,
      id_politica: idPolitica,
      horas_antes_minimo: 0,
      horas_antes_maximo: null,
      porcentaje_reembolso: 0,
    };
    currentReglas.push(nueva);
    const nextMap = new Map(this.reglasPorPolitica());
    nextMap.set(idPolitica, currentReglas);
    this.reglasPorPolitica.set(nextMap);
    this.markDirty(idPolitica);
  }

  eliminarRegla(idPolitica: string, index: number): void {
    const currentReglas = [...(this.reglasPorPolitica().get(idPolitica) ?? [])];
    currentReglas.splice(index, 1);
    const nextMap = new Map(this.reglasPorPolitica());
    nextMap.set(idPolitica, currentReglas);
    this.reglasPorPolitica.set(nextMap);
    this.markDirty(idPolitica);
  }

  onNombreInput(idPolitica: string, e: Event): void {
    const nombre = (e.target as HTMLInputElement).value;
    const updated = this.politicas().map((p) =>
      p.id === idPolitica ? { ...p, nombre } : p,
    );
    this.politicas.set(updated);
    this.markDirty(idPolitica);
  }

  onActivaToggle(idPolitica: string, e: Event): void {
    const activa = (e.target as HTMLInputElement).checked;
    const updated = this.politicas().map((p) =>
      p.id === idPolitica ? { ...p, activa } : p,
    );
    this.politicas.set(updated);
    this.markDirty(idPolitica);
  }

  guardarPolitica(p: PoliticaCancelacion): void {
    const reglas = this.reglas(p.id);

    this.politicasSvc.update(p.id, { nombre: p.nombre, activa: p.activa }).subscribe({
      next: () => {
        this.politicasSvc.saveReglas(p.id, reglas).subscribe({
          next: (savedReglas) => {
            const nextMap = new Map(this.reglasPorPolitica());
            nextMap.set(p.id, savedReglas);
            this.reglasPorPolitica.set(nextMap);
            this.clearDirty(p.id);
            this.showToast('ok', `Política "${p.nombre}" guardada`);
          },
          error: () => this.showToast('err', 'Error al guardar las reglas'),
        });
      },
      error: () => this.showToast('err', 'Error al guardar la política'),
    });
  }

  crearPolitica(): void {
    const nombre = this.nuevoNombre().trim();
    if (!nombre) return;

    this.politicasSvc
      .create({ id_cine: this.idCineSel(), nombre })
      .subscribe({
        next: (nueva) => {
          this.politicas.set([...this.politicas(), nueva]);
          this.nuevoNombre.set('');
          // Inicializar reglas vacías y expandir la nueva política
          const nextMap = new Map(this.reglasPorPolitica());
          nextMap.set(nueva.id, []);
          this.reglasPorPolitica.set(nextMap);
          this.expandida.set(nueva.id);
          this.showToast('ok', `Política "${nueva.nombre}" creada`);
        },
        error: () => this.showToast('err', 'Error al crear la política'),
      });
  }

  overlapWarning(idPolitica: string): boolean {
    const reglas = this.reglas(idPolitica);
    if (reglas.length < 2) return false;

    for (let i = 0; i < reglas.length; i++) {
      for (let j = i + 1; j < reglas.length; j++) {
        const a = reglas[i];
        const b = reglas[j];
        const aMin = a.horas_antes_minimo;
        const aMax = a.horas_antes_maximo ?? Infinity;
        const bMin = b.horas_antes_minimo;
        const bMax = b.horas_antes_maximo ?? Infinity;

        // Dos rangos [aMin, aMax) y [bMin, bMax) se solapan si aMin < bMax && bMin < aMax
        if (aMin < bMax && bMin < aMax) {
          return true;
        }
      }
    }
    return false;
  }

  private markDirty(idPolitica: string): void {
    const next = new Set(this.politicasDirty());
    next.add(idPolitica);
    this.politicasDirty.set(next);
  }

  private clearDirty(idPolitica: string): void {
    const next = new Set(this.politicasDirty());
    next.delete(idPolitica);
    this.politicasDirty.set(next);
  }

  private showToast(kind: 'ok' | 'err', text: string): void {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
