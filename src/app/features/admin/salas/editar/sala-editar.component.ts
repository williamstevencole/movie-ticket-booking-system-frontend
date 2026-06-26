import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert, LucideArmchair, LucideX } from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
import { SalasService, EditarSalaInput } from '../../../../shared/services/salas.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { extractMessage } from '../../../../shared/utils/http-errors';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

const MAX_DIM = 30;

@Component({
  selector: 'app-admin-sala-editar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideTriangleAlert,
    LucideArmchair,
    LucideX,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/salas">Salas</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Editar sala</span>
          </div>

          @if (loadError()) {
            <div class="head-row">
              <div>
                <h1>Sala no encontrada</h1>
                <p class="lead">{{ loadError() }}</p>
              </div>
            </div>
            <a class="btn btn-primary" routerLink="/admin/salas">Volver a salas</a>
          } @else {
            <div class="head-row">
              <div>
                <h1>Editar sala</h1>
                <p class="lead">
                  Ajusta el nombre y la grilla de asientos. El tipo de asiento se asigna en la distribución.
                </p>
              </div>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="cols">
                <section class="card">
                  <div class="card-title">Datos de la sala</div>

                  <div class="grid">
                    <div class="field col-span-2">
                      <label for="cine">Cine</label>
                      <input
                        id="cine"
                        class="input"
                        type="text"
                        [value]="cineNombre()"
                        disabled
                      />
                    </div>

                    <div class="field col-span-2">
                      <label for="nombre">Nombre de la sala</label>
                      <input
                        id="nombre"
                        class="input"
                        type="text"
                        autocomplete="off"
                        placeholder="Ej. Sala 1, Sala IMAX"
                        formControlName="nombre"
                        [class.invalid]="invalid('nombre')"
                      />
                      @if (invalid('nombre')) {
                        <span class="field-err">Ingresa un nombre.</span>
                      }
                    </div>

                    <div class="field">
                      <label for="filas">Filas</label>
                      <input
                        id="filas"
                        class="input"
                        type="number"
                        min="1"
                        [max]="MAX_DIM"
                        step="1"
                        formControlName="filas"
                        [class.invalid]="invalid('filas')"
                      />
                      @if (invalid('filas')) {
                        <span class="field-err">Entre 1 y {{ MAX_DIM }}.</span>
                      }
                    </div>

                    <div class="field">
                      <label for="columnas">Columnas</label>
                      <input
                        id="columnas"
                        class="input"
                        type="number"
                        min="1"
                        [max]="MAX_DIM"
                        step="1"
                        formControlName="columnas"
                        [class.invalid]="invalid('columnas')"
                      />
                      @if (invalid('columnas')) {
                        <span class="field-err">Entre 1 y {{ MAX_DIM }}.</span>
                      }
                    </div>
                  </div>
                </section>

                <section class="card preview-card">
                  <div class="card-title">Vista previa</div>

                  <div class="cap-row">
                    <span class="cap-mark">
                      <svg lucideArmchair [size]="18"></svg>
                    </span>
                    <div>
                      <div class="cap-num tnum">{{ capacidad() }}</div>
                      <div class="cap-label">asientos · {{ filasN() }} × {{ colsN() }}</div>
                    </div>
                  </div>

                  @if (gridValid()) {
                    <div class="screen">PANTALLA</div>
                    <div
                      class="seatmap"
                      [style.grid-template-columns]="'repeat(' + colsN() + ', 1fr)'"
                    >
                      @for (s of seats(); track s) {
                        <span class="seat"></span>
                      }
                    </div>
                  } @else {
                    <p class="preview-hint">Ingresa filas y columnas para ver la grilla.</p>
                  }
                </section>
              </div>

              @if (formError(); as msg) {
                <div class="alert">
                  <svg lucideTriangleAlert [size]="14"></svg>
                  <span>{{ msg }}</span>
                </div>
              }

              <div class="foot">
                <a class="btn" routerLink="/admin/salas">Cancelar</a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="saving() || form.invalid || form.pristine"
                >
                  {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          }
        </div>
      </main>
    </div>

    @if (confirmDialog(); as d) {
      <div class="overlay" (click)="cancelConfirm()">
        <div class="dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <header class="dlg-head">
            <h2 id="confirm-title">Confirmar cambio de dimensiones</h2>
            <button class="icon-btn" (click)="cancelConfirm()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <div class="confirm-alert">
              <svg lucideTriangleAlert [size]="18"></svg>
              <div>
                <p class="confirm-lead">
                  Esta sala tiene <strong>{{ d.funcionesActivas }}</strong>
                  función{{ d.funcionesActivas === 1 ? '' : 'es' }} activa{{ d.funcionesActivas === 1 ? '' : 's' }}.
                </p>
                <p class="confirm-note">
                  Cambiar las dimensiones puede invalidar reservas existentes. El catálogo de asientos se regenerará y los tipos se preservarán donde la celda sobreviva.
                </p>
              </div>
            </div>
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="cancelConfirm()" [disabled]="saving()">Cancelar</button>
            <button class="btn btn-danger" (click)="confirmForce()" [disabled]="saving()">
              {{ saving() ? 'Guardando…' : 'Sí, cambiar dimensiones' }}
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrls: ['../crear/sala-form.component.scss', './sala-editar.component.scss'],
})
export class AdminSalaEditarComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cinesSvc = inject(CinesService);
  private salasSvc = inject(SalasService);
  private toast = inject(ToastService);

  readonly MAX_DIM = MAX_DIM;

  readonly cineNombre = signal<string>('');
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly confirmDialog = signal<{
    funcionesActivas: number;
    pendingInput: EditarSalaInput;
  } | null>(null);

  readonly filasN = signal(0);
  readonly colsN = signal(0);

  readonly capacidad = computed(() => this.filasN() * this.colsN());
  readonly gridValid = computed(
    () =>
      this.filasN() >= 1 &&
      this.filasN() <= MAX_DIM &&
      this.colsN() >= 1 &&
      this.colsN() <= MAX_DIM,
  );
  readonly seats = computed(() =>
    this.gridValid() ? Array.from({ length: this.capacidad() }, (_, i) => i) : [],
  );

  private idCine = '';
  private idSala = '';

  readonly form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    filas: [1, [Validators.required, Validators.min(1), Validators.max(MAX_DIM)]],
    columnas: [1, [Validators.required, Validators.min(1), Validators.max(MAX_DIM)]],
  });

  constructor() {
    this.idCine = this.route.snapshot.paramMap.get('cineId') ?? '';
    this.idSala = this.route.snapshot.paramMap.get('salaId') ?? '';

    this.cinesSvc.getById(this.idCine).subscribe({
      next: (cine: Cine) => this.cineNombre.set(cine.nombre),
      error: () => this.cineNombre.set('—'),
    });

    this.salasSvc.getById(this.idSala).subscribe({
      next: (sala) => {
        this.form.patchValue({
          nombre: sala.nombre,
          filas: sala.filas,
          columnas: sala.columnas,
        });
        this.form.markAsPristine();
        this.syncDims(this.form.value);
      },
      error: (err) =>
        this.loadError.set(extractMessage(err)),
    });

    this.form.valueChanges.subscribe((v) => this.syncDims(v));
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  submit() {
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.pristine) return;

    const v = this.form.value;
    const input: EditarSalaInput = {
      nombre: v.nombre!,
      filas: Number(v.filas),
      columnas: Number(v.columnas),
    };
    this.persist(input, false);
  }

  confirmForce() {
    const d = this.confirmDialog();
    if (!d) return;
    this.persist(d.pendingInput, true);
  }

  cancelConfirm() {
    if (this.saving()) return;
    this.confirmDialog.set(null);
  }

  private persist(input: EditarSalaInput, force: boolean) {
    this.saving.set(true);
    this.salasSvc
      .update(this.idSala, input, force ? { force: true } : undefined)
      .subscribe({
        next: (sala) => {
          this.saving.set(false);
          this.confirmDialog.set(null);
          if (sala.warning) {
            this.toast.show(sala.warning);
          } else {
            this.toast.show(`${sala.nombre} actualizada`);
          }
          this.router.navigate(['/admin/salas']);
        },
        error: (err) => {
          this.saving.set(false);
          if (
            err?.status === 409 &&
            err?.error?.code === 'REQUIRES_DIMENSION_CHANGE_CONFIRMATION'
          ) {
            this.confirmDialog.set({
              funcionesActivas: Number(err.error.funcionesActivas) || 0,
              pendingInput: input,
            });
            return;
          }
          this.confirmDialog.set(null);
          this.formError.set(extractMessage(err));
          this.toast.show(`Error al actualizar: ${extractMessage(err)}`);
        },
      });
  }

  private syncDims(v: { filas?: unknown; columnas?: unknown }) {
    this.filasN.set(this.toInt(v.filas));
    this.colsN.set(this.toInt(v.columnas));
  }

  private toInt(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? Math.floor(n) : 0;
  }
}
