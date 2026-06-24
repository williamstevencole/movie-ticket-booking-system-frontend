import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideTriangleAlert,
  LucideArrowLeft,
} from '@lucide/angular';

import {
  Pelicula,
  PeliculasService,
} from '../../../../shared/services/peliculas.service';
import {
  Genero,
  GenerosService,
} from '../../../../shared/services/generos.service';
import {
  Idioma,
  IdiomasService,
} from '../../../../shared/services/idiomas.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { PosterUploadComponent } from '../../../../shared/components/poster-upload.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;

@Component({
  selector: 'app-admin-pelicula-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminSidebarComponent,
    PosterUploadComponent,
    LucideTriangleAlert,
    LucideArrowLeft,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/peliculas">Películas</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">{{ isEdit() ? 'Editar' : 'Nueva' }}</span>
          </div>

          <div class="head-row">
            <div>
              <h1>{{ isEdit() ? 'Editar película' : 'Nueva película' }}</h1>
              <p class="lead">
                {{ isEdit()
                  ? 'Actualiza la información del catálogo. Los cambios aplican a futuras funciones.'
                  : 'Agrega una película al catálogo. Después podrás programarle funciones.'
                }}
              </p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <section class="card">
              <div class="card-title">Información</div>

              <div class="grid">
                <div class="field col-span-2">
                  <label for="titulo">Título</label>
                  <input
                    id="titulo"
                    class="input"
                    type="text"
                    placeholder="Ej. Tormenta sobre el Pacífico"
                    formControlName="titulo"
                    [class.invalid]="invalid('titulo')"
                    autocomplete="off"
                  />
                  @if (invalid('titulo')) {
                    <span class="field-err">El título es obligatorio.</span>
                  }
                </div>

                <div class="field col-span-2">
                  <label for="tagline">Tagline</label>
                  <input
                    id="tagline"
                    class="input"
                    type="text"
                    placeholder="Frase corta (opcional, máx. 200 caracteres)"
                    formControlName="tagline"
                    [class.invalid]="invalid('tagline')"
                    autocomplete="off"
                  />
                  @if (invalid('tagline')) {
                    <span class="field-err">Máximo 200 caracteres.</span>
                  }
                </div>

                <div class="field col-span-2">
                  <label for="sinopsis">Sinopsis</label>
                  <textarea
                    id="sinopsis"
                    class="textarea"
                    rows="4"
                    placeholder="Resumen breve de la trama (lo verá el comprador en la cartelera)"
                    formControlName="sinopsis"
                    [class.invalid]="invalid('sinopsis')"
                  ></textarea>
                  @if (invalid('sinopsis')) {
                    <span class="field-err">La sinopsis es obligatoria.</span>
                  }
                </div>

                <div class="field">
                  <label for="duracion">Duración (min)</label>
                  <input
                    id="duracion"
                    class="input"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="120"
                    formControlName="duracion_min"
                    [class.invalid]="invalid('duracion_min')"
                  />
                  @if (invalid('duracion_min')) {
                    <span class="field-err">Entre 1 y 500 minutos.</span>
                  }
                </div>

                <div class="field">
                  <label for="fecha">Fecha de estreno</label>
                  <input
                    id="fecha"
                    class="input"
                    type="date"
                    formControlName="fecha_estreno"
                    [class.invalid]="invalid('fecha_estreno')"
                  />
                  @if (invalid('fecha_estreno')) {
                    <span class="field-err">Selecciona una fecha.</span>
                  }
                </div>

                <div class="field">
                  <label for="idioma">Idioma</label>
                  <select
                    id="idioma"
                    class="select"
                    formControlName="id_idioma"
                    [class.invalid]="invalid('id_idioma')"
                  >
                    <option value="" disabled>Selecciona…</option>
                    @for (i of idiomas(); track i.id) {
                      <option [value]="i.id">{{ i.nombre }}</option>
                    }
                  </select>
                  @if (invalid('id_idioma')) {
                    <span class="field-err">Selecciona un idioma.</span>
                  }
                </div>

                <div class="field col-span-2">
                  <label>Géneros</label>
                  <div class="chips">
                    @for (g of generos(); track g.id) {
                      <button
                        type="button"
                        class="chip"
                        [class.on]="hasGenero(g.id)"
                        (click)="toggleGenero(g.id)"
                      >
                        {{ g.nombre }}
                      </button>
                    }
                  </div>
                  @if (invalid('id_generos')) {
                    <span class="field-err">Selecciona al menos un género.</span>
                  } @else {
                    <span class="help">Toca para añadir o quitar. Mín. 1, máx. 5.</span>
                  }
                </div>

                <div class="field col-span-2">
                  <label class="toggle-label">
                    <input
                      type="checkbox"
                      class="toggle-check"
                      formControlName="activo"
                    />
                    <span class="toggle-text">
                      Película activa
                      <small>Visible al comprador y programable para funciones.</small>
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card-title">Poster</div>
              <app-poster-upload
                [posterUrl]="posterUrl()"
                (posterChange)="onPosterChange($event)"
                (fileChange)="onPosterFileChange($event)"
              />
            </section>

            <section class="card" formGroupName="ficha_tecnica">
              <div class="card-title">Ficha técnica</div>
              <div class="grid">
                <div class="field">
                  <label for="ft-direccion">Dirección</label>
                  <input id="ft-direccion" class="input" type="text" formControlName="direccion" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-guion">Guion</label>
                  <input id="ft-guion" class="input" type="text" formControlName="guion" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-fotografia">Fotografía</label>
                  <input id="ft-fotografia" class="input" type="text" formControlName="fotografia" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-musica">Música</label>
                  <input id="ft-musica" class="input" type="text" formControlName="musica" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-pais">País</label>
                  <input id="ft-pais" class="input" type="text" formControlName="pais" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-productora">Productora</label>
                  <input id="ft-productora" class="input" type="text" formControlName="productora" autocomplete="off" />
                </div>
                <div class="field">
                  <label for="ft-distribuidor">Distribuidor</label>
                  <input id="ft-distribuidor" class="input" type="text" formControlName="distribuidor" autocomplete="off" />
                </div>
                <div class="field col-span-2">
                  <label for="ft-reparto">Reparto principal</label>
                  <textarea
                    id="ft-reparto"
                    class="textarea"
                    rows="2"
                    placeholder="Nombres separados por coma: Ej. Ana Torres, Luis Vega"
                    formControlName="reparto"
                  ></textarea>
                  <span class="help">Separa los nombres por coma.</span>
                </div>
              </div>
            </section>

            @if (formError(); as msg) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>{{ msg }}</span>
              </div>
            }

            <div class="foot">
              <a routerLink="/admin/peliculas" class="foot-left">
                <svg lucideArrowLeft [size]="14" style="vertical-align: -2px; margin-right: 4px;"></svg>
                Volver al listado
              </a>
              <div class="foot-right">
                <a class="btn" routerLink="/admin/peliculas">Cancelar</a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="saving() || form.invalid || !isDirtyLike()"
                >
                  {{ saving()
                    ? 'Guardando…'
                    : (isEdit() ? 'Guardar cambios' : 'Crear película')
                  }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './pelicula-form.component.scss',
})
export class AdminPeliculaFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peliculasSvc = inject(PeliculasService);
  private generosSvc = inject(GenerosService);
  private idiomasSvc = inject(IdiomasService);
  private http = inject(HttpClient);

  readonly generos = signal<Genero[]>([]);
  readonly idiomas = signal<Idioma[]>([]);
  readonly posterUrl = signal<string | null>(null);
  /** Raw File selected by the user; null if no new file chosen or poster removed */
  readonly posterFile = signal<File | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly toast = signal<Toast>(null);
  readonly originalSnapshot = signal<string>('');

  readonly editId = signal<string | null>(null);
  readonly isEdit = computed(() => this.editId() !== null);

  readonly form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    tagline: ['', Validators.maxLength(200)],
    sinopsis: ['', [Validators.required, Validators.minLength(10)]],
    duracion_min: [120, [Validators.required, Validators.min(1), Validators.max(500)]],
    fecha_estreno: ['', Validators.required],
    id_idioma: ['', Validators.required],
    id_generos: [
      [] as string[],
      (ctrl: AbstractControl): ValidationErrors | null =>
        Array.isArray(ctrl.value) && ctrl.value.length > 0
          ? null
          : { required: true },
    ],
    activo: [true],
    ficha_tecnica: this.fb.group({
      direccion: [''],
      guion: [''],
      fotografia: [''],
      reparto: [''],
      musica: [''],
      pais: [''],
      productora: [''],
      distribuidor: [''],
    }),
  });

  readonly isDirtyLike = computed(() => {
    if (!this.isEdit()) return true;
    const snapshot = this.serializeForCompare();
    return snapshot !== this.originalSnapshot();
  });

  constructor() {
    this.generosSvc.list().subscribe((g) => this.generos.set(g));
    this.idiomasSvc.list().subscribe((i) => this.idiomas.set(i));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loadForEdit(id);
    }
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  hasGenero(id: string): boolean {
    return (this.form.value.id_generos as string[]).includes(id);
  }

  toggleGenero(id: string) {
    const current = (this.form.value.id_generos as string[]) ?? [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : current.length >= 5
        ? current
        : [...current, id];
    this.form.patchValue({ id_generos: next });
    this.form.get('id_generos')?.markAsDirty();
  }

  onPosterChange(url: string | null) {
    this.posterUrl.set(url);
  }

  onPosterFileChange(file: File | null) {
    this.posterFile.set(file);
  }

  submit() {
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const repartoRaw: string = raw.ficha_tecnica?.reparto ?? '';
    const reparto = repartoRaw
      ? repartoRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const fichaTecnica = {
      ...raw.ficha_tecnica,
      reparto,
    };

    const payload = {
      titulo: raw.titulo!,
      sinopsis: raw.sinopsis!,
      duracion_min: Number(raw.duracion_min),
      fecha_estreno: new Date(raw.fecha_estreno!).toISOString(),
      id_generos: raw.id_generos!,
      id_idioma: raw.id_idioma!,
      poster_url: this.posterUrl(),
      activo: raw.activo ?? true,
      tagline: raw.tagline || undefined,
      ficha_tecnica: Object.values(fichaTecnica).some(
        (v) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
      )
        ? fichaTecnica
        : undefined,
    };

    const editId = this.editId();
    const obs = editId
      ? this.peliculasSvc.update(editId, payload)
      : this.peliculasSvc.create(payload);

    obs.subscribe({
      next: (p) => {
        const posterFile = this.posterFile();
        if (posterFile) {
          this.uploadPoster(p.id, posterFile, editId);
        } else {
          this.saving.set(false);
          this.router.navigate(['/admin/peliculas'], {
            state: { toast: editId ? `"${p.titulo}" actualizada` : `"${p.titulo}" creada` },
          });
        }
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(e?.message ?? 'No se pudo guardar la película');
      },
    });
  }

  private uploadPoster(peliculaId: string, file: File, editId: string | null) {
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ poster_url: string }>(`/api/peliculas/${peliculaId}/poster`, fd).subscribe({
      next: (res) => {
        this.posterUrl.set(res.poster_url);
        this.posterFile.set(null);
        this.saving.set(false);
        const titulo = this.form.get('titulo')?.value ?? '';
        this.router.navigate(['/admin/peliculas'], {
          state: { toast: editId ? `"${titulo}" actualizada` : `"${titulo}" creada` },
        });
      },
      error: () => {
        // Poster upload failed but película was saved — navigate with warning
        this.saving.set(false);
        const titulo = this.form.get('titulo')?.value ?? '';
        this.router.navigate(['/admin/peliculas'], {
          state: {
            toast: editId
              ? `"${titulo}" actualizada (poster no se pudo subir)`
              : `"${titulo}" creada (poster no se pudo subir)`,
          },
        });
      },
    });
  }

  private loadForEdit(id: string) {
    this.peliculasSvc.getById(id).subscribe({
      next: (p) => this.fillFromPelicula(p),
      error: () => {
        this.formError.set('No se encontró la película');
        setTimeout(() => this.router.navigate(['/admin/peliculas']), 1200);
      },
    });
  }

  private fillFromPelicula(p: Pelicula) {
    const fecha = p.fecha_estreno ? p.fecha_estreno.substring(0, 10) : '';
    const ft = p.ficha_tecnica;
    this.form.patchValue({
      titulo: p.titulo,
      tagline: p.tagline ?? '',
      sinopsis: p.sinopsis,
      duracion_min: p.duracion_min,
      fecha_estreno: fecha,
      id_idioma: p.id_idioma,
      id_generos: [...p.id_generos],
      activo: p.activo,
      ficha_tecnica: {
        direccion: ft?.direccion ?? '',
        guion: ft?.guion ?? '',
        fotografia: ft?.fotografia ?? '',
        reparto: ft?.reparto ? ft.reparto.join(', ') : '',
        musica: ft?.musica ?? '',
        pais: ft?.pais ?? '',
        productora: ft?.productora ?? '',
        distribuidor: ft?.distribuidor ?? '',
      },
    });
    this.posterUrl.set(p.poster_url);
    this.originalSnapshot.set(this.serializeForCompare());
  }

  private serializeForCompare(): string {
    const v = this.form.value;
    return JSON.stringify({
      ...v,
      id_generos: [...(v.id_generos ?? [])].sort(),
      poster_url: this.posterUrl(),
    });
  }
}
