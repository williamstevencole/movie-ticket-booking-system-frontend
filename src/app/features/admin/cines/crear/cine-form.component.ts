import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert, LucideBuilding2 } from '@lucide/angular';

import { CinesService } from '../../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

@Component({
  selector: 'app-admin-cine-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideTriangleAlert,
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
            <a routerLink="/admin/cines">Cines</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Nuevo</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Nuevo cine</h1>
              <p class="lead">
                Registra una sede. Las salas se agregan después desde el detalle del cine.
              </p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <section class="card">
              <div class="card-title">Datos del cine</div>

              <div class="grid">
                <div class="field col-span-2">
                  <label for="nombre">Nombre</label>
                  <input
                    id="nombre"
                    class="input"
                    type="text"
                    autocomplete="off"
                    placeholder="Ej. Cinépolis Oakland Mall"
                    formControlName="nombre"
                    [class.invalid]="invalid('nombre')"
                  />
                  @if (invalid('nombre')) {
                    <span class="field-err">Ingresa un nombre.</span>
                  }
                </div>

                <div class="field">
                  <label for="ciudad">Ciudad</label>
                  <select
                    id="ciudad"
                    class="select"
                    formControlName="id_ciudad"
                    [class.invalid]="invalid('id_ciudad')"
                  >
                    <option value="" disabled>Selecciona…</option>
                    @for (c of ciudades(); track c.id) {
                      <option [value]="c.id">{{ c.nombre }}</option>
                    }
                  </select>
                  @if (invalid('id_ciudad')) {
                    <span class="field-err">Selecciona una ciudad.</span>
                  }
                </div>

                <div class="field">
                  <label for="direccion">Dirección <span class="opt">(opcional)</span></label>
                  <input
                    id="direccion"
                    class="input"
                    type="text"
                    autocomplete="off"
                    placeholder="Ej. Diagonal 6 13-01, Zona 10"
                    formControlName="direccion"
                  />
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card-title">Resumen</div>
              <div class="preview">
                <span class="preview-mark">
                  <svg lucideBuilding2 [size]="20"></svg>
                </span>
                <div class="preview-body">
                  <div class="preview-name">{{ form.value.nombre?.trim() || 'Nuevo cine' }}</div>
                  <div class="preview-sub">
                    {{ ciudadNombre(form.value.id_ciudad) }}
                    @if (form.value.direccion?.trim()) {
                      · {{ form.value.direccion!.trim() }}
                    }
                  </div>
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
              <a class="btn" routerLink="/admin/cines">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="saving() || form.invalid"
              >
                {{ saving() ? 'Guardando…' : 'Crear cine' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styleUrl: './cine-form.component.scss',
})
export class AdminCineFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);

  readonly ciudades = signal<Ciudad[]>([]);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly ciudadesById = computed(() => {
    const map = new Map<string, Ciudad>();
    for (const c of this.ciudades()) map.set(c.id, c);
    return map;
  });

  readonly form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    id_ciudad: ['', Validators.required],
    direccion: [''],
  });

  constructor() {
    this.ciudadesSvc.list().subscribe((c) => this.ciudades.set(c));
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  ciudadNombre(id: string | null | undefined): string {
    if (!id) return 'Sin ciudad';
    return this.ciudadesById().get(id)?.nombre ?? 'Sin ciudad';
  }

  submit() {
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const v = this.form.value;
    this.cinesSvc
      .create({
        nombre: v.nombre!,
        id_ciudad: v.id_ciudad!,
        direccion: v.direccion?.trim() || null,
      })
      .subscribe({
        next: (cine) => {
          this.saving.set(false);
          this.router.navigate(['/admin/cines'], {
            state: { toast: `${cine.nombre} creado` },
          });
        },
        error: (e) => {
          this.saving.set(false);
          this.formError.set(e?.message ?? 'No se pudo crear el cine');
        },
      });
  }
}
