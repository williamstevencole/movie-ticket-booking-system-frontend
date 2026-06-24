import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert, LucideCircleCheck } from '@lucide/angular';

import {
  ConflictoFuncion,
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../../shared/services/peliculas.service';
import {
  Cine,
  CinesService,
  Sala,
} from '../../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

@Component({
  selector: 'app-admin-funcion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    AdminSidebarComponent,
    LucideTriangleAlert,
    LucideCircleCheck,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/funciones">Funciones</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">{{ isEdit() ? 'Editar' : 'Nueva' }}</span>
          </div>

          <div class="head-row">
            <div>
              <h1>{{ isEdit() ? 'Editar función' : 'Nueva función' }}</h1>
              <p class="lead">
                {{ isEdit()
                  ? 'Actualiza horario, sala o precio. Las reservas existentes no se mueven solas.'
                  : 'Programa una nueva función. Verificamos conflictos de horario en la misma sala.'
                }}
              </p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <section class="card">
              <div class="card-title">Detalles</div>

              <div class="grid">
                <div class="field col-span-2">
                  <label for="pelicula">Película</label>
                  <select
                    id="pelicula"
                    class="select"
                    formControlName="id_pelicula"
                    [class.invalid]="invalid('id_pelicula')"
                  >
                    <option value="" disabled>Selecciona una película…</option>
                    @for (p of peliculasActivas(); track p.id) {
                      <option [value]="p.id">{{ p.titulo }} · {{ p.duracion_min }} min</option>
                    }
                  </select>
                  @if (invalid('id_pelicula')) {
                    <span class="field-err">Selecciona una película.</span>
                  }
                </div>

                <div class="field">
                  <label for="cine">Cine</label>
                  <select
                    id="cine"
                    class="select"
                    formControlName="id_cine"
                    [class.invalid]="invalid('id_cine')"
                  >
                    <option value="" disabled>Selecciona…</option>
                    @for (c of cines(); track c.id) {
                      <option [value]="c.id">{{ c.nombre }}</option>
                    }
                  </select>
                  @if (invalid('id_cine')) {
                    <span class="field-err">Selecciona un cine.</span>
                  }
                </div>

                <div class="field">
                  <label for="sala">Sala</label>
                  <select
                    id="sala"
                    class="select"
                    formControlName="id_sala"
                    [class.invalid]="invalid('id_sala')"
                    [disabled]="!form.value.id_cine"
                  >
                    <option value="" disabled>Selecciona…</option>
                    @for (s of salasDelCine(); track s.id) {
                      <option [value]="s.id">
                        Sala {{ s.nombre }} · {{ s.filas * s.columnas }} asientos
                      </option>
                    }
                  </select>
                  @if (invalid('id_sala')) {
                    <span class="field-err">Selecciona una sala.</span>
                  }
                </div>

                <div class="field">
                  <label for="fecha">Fecha y hora de inicio</label>
                  <input
                    id="fecha"
                    class="input"
                    type="datetime-local"
                    formControlName="fecha_hora"
                    [class.invalid]="invalid('fecha_hora')"
                  />
                  @if (invalid('fecha_hora')) {
                    <span class="field-err">Selecciona fecha y hora.</span>
                  }
                </div>

              </div>
            </section>

            <section class="card">
              <div class="card-title">Resumen</div>

              <div class="preview">
                <div class="preview-row">
                  <span class="label">Película</span>
                  <span class="value">{{ peliculaSeleccionada()?.titulo ?? '—' }}</span>
                </div>
                <div class="preview-row">
                  <span class="label">Duración</span>
                  <span class="value tnum">
                    {{ peliculaSeleccionada()?.duracion_min ?? 0 }} min
                  </span>
                </div>
                <div class="preview-row">
                  <span class="label">Cine · sala</span>
                  <div>
                    <div class="value">
                      {{ cineSeleccionado()?.nombre ?? '—' }}
                    </div>
                    <div class="value-sub">
                      {{ salaSeleccionada()
                        ? 'Sala ' + salaSeleccionada()!.nombre + ' · ' + capacidadSala() + ' asientos'
                        : 'Sala —'
                      }}
                    </div>
                  </div>
                </div>
                <div class="preview-row">
                  <span class="label">Inicio</span>
                  <span class="value tnum">
                    {{ fechaInicioValid()
                      ? (fechaInicioISO() | date: 'EEEE d MMM · HH:mm')
                      : '—'
                    }}
                  </span>
                </div>
                <div class="preview-row">
                  <span class="label">Finaliza</span>
                  <span class="value tnum">
                    {{ fechaFinISO() ? (fechaFinISO() | date: 'HH:mm') : '—' }}
                  </span>
                </div>

                @if (conflictos().length > 0) {
                  <div class="alert-conflict">
                    <svg lucideTriangleAlert [size]="14"></svg>
                    <span>
                      Conflicto: ya hay {{ conflictos().length }}
                      {{ conflictos().length === 1 ? 'función' : 'funciones' }}
                      en esta sala en horario solapado.
                      Ajusta la hora o cambia de sala.
                    </span>
                  </div>
                } @else if (checkedConflicts() && fechaInicioValid() && form.value.id_sala) {
                  <div class="alert-ok">
                    <svg lucideCircleCheck [size]="14"></svg>
                    <span>Sin conflictos en esta sala.</span>
                  </div>
                }
              </div>
            </section>

            @if (formError(); as msg) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>{{ msg }}</span>
              </div>
            }

            <div class="foot">
              <a class="btn" routerLink="/admin/funciones">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="saving() || form.invalid || conflictos().length > 0"
              >
                {{ saving()
                  ? 'Guardando…'
                  : (isEdit() ? 'Guardar cambios' : 'Programar función')
                }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styleUrl: './funcion-form.component.scss',
})
export class AdminFuncionFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly conflictos = signal<ConflictoFuncion[]>([]);
  readonly checkedConflicts = signal(false);

  readonly editId = signal<string | null>(null);
  readonly isEdit = computed(() => this.editId() !== null);

  readonly peliculasActivas = computed(() =>
    this.peliculas().filter((p) => p.activo),
  );

  readonly form: FormGroup = this.fb.group({
    id_pelicula: ['', Validators.required],
    id_cine: ['', Validators.required],
    id_sala: ['', Validators.required],
    fecha_hora: ['', Validators.required],
  });

  readonly peliculaSeleccionada = signal<Pelicula | null>(null);
  readonly cineSeleccionado = signal<Cine | null>(null);
  readonly salaSeleccionada = signal<Sala | null>(null);

  readonly capacidadSala = computed(() => {
    const s = this.salaSeleccionada();
    return s ? s.filas * s.columnas : 0;
  });

  readonly fechaInicioValid = signal(false);
  readonly fechaInicioISO = signal<string>('');
  readonly fechaFinISO = signal<string>('');

  private conflictTimer: number | undefined;

  constructor() {
    this.peliculasSvc.list().subscribe((d) => this.peliculas.set(d.data));
    this.cinesSvc.list().subscribe((p) => this.cines.set(p.data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loadForEdit(id);
    }

    this.form.valueChanges.subscribe((v) => this.onFormChange(v));

    effect(() => {
      const cine = this.cines().find((c) => c.id === this.form.value.id_cine) ?? null;
      this.cineSeleccionado.set(cine);
    });
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  salasDelCine(): Sala[] {
    return this.cineSeleccionado()?.salas ?? [];
  }

  submit() {
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.conflictos().length > 0) return;

    this.saving.set(true);
    const v = this.form.value;
    const payload = {
      id_pelicula: v.id_pelicula!,
      id_cine: v.id_cine!,
      id_sala: v.id_sala!,
      fecha_hora: new Date(v.fecha_hora!).toISOString(),
    };

    const editId = this.editId();
    const obs = editId
      ? this.funcionesSvc.update(editId, payload)
      : this.funcionesSvc.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        const msg = editId ? 'Función actualizada' : 'Función programada';
        this.router.navigate(['/admin/funciones'], { state: { toast: msg } });
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(e?.message ?? 'No se pudo guardar la función');
      },
    });
  }

  private loadForEdit(id: string) {
    this.funcionesSvc.getById(id).subscribe({
      next: (f) => this.fillFromFuncion(f),
      error: () => {
        this.formError.set('No se encontró la función');
        setTimeout(() => this.router.navigate(['/admin/funciones']), 1200);
      },
    });
  }

  private fillFromFuncion(f: Funcion) {
    const d = new Date(f.fecha_hora);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    this.form.patchValue({
      id_pelicula: f.id_pelicula,
      id_cine: f.id_cine,
      id_sala: f.id_sala,
      fecha_hora: local,
    });
  }

  private onFormChange(v: any) {
    const pelicula = this.peliculas().find((p) => p.id === v.id_pelicula) ?? null;
    this.peliculaSeleccionada.set(pelicula);

    const cine = this.cines().find((c) => c.id === v.id_cine) ?? null;
    this.cineSeleccionado.set(cine);

    const sala = cine?.salas.find((s) => s.id === v.id_sala) ?? null;
    this.salaSeleccionada.set(sala);

    if (v.fecha_hora) {
      const start = new Date(v.fecha_hora);
      if (!Number.isNaN(start.getTime())) {
        this.fechaInicioValid.set(true);
        this.fechaInicioISO.set(start.toISOString());
        if (pelicula) {
          const end = new Date(start.getTime() + pelicula.duracion_min * 60000);
          this.fechaFinISO.set(end.toISOString());
        } else {
          this.fechaFinISO.set('');
        }
      } else {
        this.fechaInicioValid.set(false);
        this.fechaInicioISO.set('');
        this.fechaFinISO.set('');
      }
    } else {
      this.fechaInicioValid.set(false);
      this.fechaInicioISO.set('');
      this.fechaFinISO.set('');
    }

    this.scheduleConflictCheck();
  }

  private scheduleConflictCheck() {
    if (this.conflictTimer) {
      clearTimeout(this.conflictTimer);
    }
    this.conflictTimer = setTimeout(() => this.runConflictCheck(), 250) as unknown as number;
  }

  private runConflictCheck() {
    const v = this.form.value;
    const pelicula = this.peliculaSeleccionada();
    if (!v.id_cine || !v.id_sala || !v.fecha_hora || !pelicula) {
      this.conflictos.set([]);
      this.checkedConflicts.set(false);
      return;
    }
    const iso = new Date(v.fecha_hora).toISOString();
    this.funcionesSvc
      .checkConflictos({
        id_cine: v.id_cine,
        id_sala: v.id_sala,
        fecha_hora: iso,
        duracion_min: pelicula.duracion_min,
        ignorar_id: this.editId() ?? undefined,
      })
      .subscribe((cs) => {
        this.conflictos.set(cs);
        this.checkedConflicts.set(true);
      });
  }
}
