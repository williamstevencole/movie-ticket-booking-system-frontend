import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert, LucideBuilding2 } from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../../shared/services/ciudades.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { extractMessage } from '../../../../shared/utils/http-errors';

@Component({
  selector: 'app-admin-cine-editar',
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
            <span class="crumb-current">Editar</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Editar cine</h1>
              <p class="lead">
                Actualiza el nombre, la ciudad o la dirección. Las salas se gestionan aparte.
              </p>
            </div>
          </div>

          @if (loading()) {
            <section class="card">
              <div class="loading">Cargando cine…</div>
            </section>
          } @else if (notFound()) {
            <section class="card">
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>No se encontró el cine. Redirigiendo al listado…</span>
              </div>
            </section>
          } @else {
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
                    <div class="preview-name">{{ form.value.nombre?.trim() || 'Cine' }}</div>
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
  `,
  styleUrl: '../crear/cine-form.component.scss',
})
export class AdminCineEditarComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private toast = inject(ToastService);

  readonly ciudades = signal<Ciudad[]>([]);
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly formError = signal<string | null>(null);

  private readonly cineId = this.route.snapshot.paramMap.get('id');

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

    const id = this.cineId;
    if (!id) {
      this.fail();
      return;
    }
    this.cinesSvc.getById(id).subscribe({
      next: (cine) => this.fillFromCine(cine),
      error: (err) => {
        this.formError.set(extractMessage(err));
        this.fail();
      },
    });
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
    if (this.form.invalid || !this.cineId) return;

    this.saving.set(true);
    const v = this.form.value;
    this.cinesSvc
      .update(this.cineId, {
        nombre: v.nombre!,
        id_ciudad: v.id_ciudad!,
        direccion: v.direccion?.trim() || null,
      })
      .subscribe({
        next: (cine) => {
          this.saving.set(false);
          this.toast.show(`${cine.nombre} actualizado`);
          this.router.navigate(['/admin/cines']);
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(extractMessage(err));
          this.toast.show(`Error al actualizar: ${extractMessage(err)}`);
        },
      });
  }

  private fillFromCine(cine: Cine) {
    this.form.patchValue({
      nombre: cine.nombre,
      id_ciudad: cine.id_ciudad,
      direccion: cine.direccion ?? '',
    });
    this.form.markAsPristine();
    this.loading.set(false);
  }

  private fail() {
    this.loading.set(false);
    this.notFound.set(true);
    setTimeout(() => this.router.navigate(['/admin/cines']), 1400);
  }
}
