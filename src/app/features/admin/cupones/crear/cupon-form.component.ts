import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert, LucideGift } from '@lucide/angular';

import { CuponesService } from '../../../../shared/services/cupones.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../../shared/utils/http-errors';

@Component({
  selector: 'app-admin-cupon-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideTriangleAlert,
    LucideGift,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/cupones">Cupones</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Nuevo</span>
          </div>

          <div class="head-row">
            <div>
              <h1>Nuevo cupón</h1>
              <p class="lead">
                Define el código, el descuento y su vigencia. Inicia activo y con 0 usos.
              </p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="cols">
              <section class="card">
                <div class="card-title">Datos del cupón</div>

                <div class="grid">
                  <div class="field col-span-2">
                    <label for="codigo">Código</label>
                    <input
                      id="codigo"
                      class="input code-input"
                      type="text"
                      autocomplete="off"
                      placeholder="Ej. BIENVENIDA10"
                      formControlName="codigo"
                      [class.invalid]="invalid('codigo')"
                    />
                    @if (invalid('codigo')) {
                      <span class="field-err">Ingresa un código.</span>
                    }
                  </div>

                  <div class="field">
                    <label for="tipo">Tipo de descuento</label>
                    <select
                      id="tipo"
                      class="select"
                      formControlName="tipo"
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="monto">Monto fijo (L)</option>
                    </select>
                  </div>

                  <div class="field">
                    <label for="valor">
                      Valor
                      <span class="opt">{{ esPorcentaje() ? '(%)' : '(L)' }}</span>
                    </label>
                    <input
                      id="valor"
                      class="input"
                      type="number"
                      min="1"
                      [max]="esPorcentaje() ? 100 : null"
                      step="1"
                      formControlName="valor"
                      [class.invalid]="invalid('valor')"
                    />
                    @if (invalid('valor')) {
                      <span class="field-err">
                        {{ esPorcentaje() ? 'Entre 1 y 100.' : 'Mayor a 0.' }}
                      </span>
                    }
                  </div>

                  <div class="field">
                    <label for="fecha">Fecha de expiración</label>
                    <input
                      id="fecha"
                      class="input"
                      type="date"
                      [min]="minDate"
                      formControlName="fecha_expiracion"
                      [class.invalid]="invalid('fecha_expiracion')"
                    />
                    @if (invalid('fecha_expiracion')) {
                      <span class="field-err">Selecciona una fecha futura.</span>
                    }
                  </div>

                  <div class="field">
                    <label for="usos">Usos máximos <span class="opt">(opcional)</span></label>
                    <input
                      id="usos"
                      class="input"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ilimitado"
                      formControlName="usos_maximos"
                      [class.invalid]="invalid('usos_maximos')"
                    />
                    @if (invalid('usos_maximos')) {
                      <span class="field-err">Entero mayor a 0 o vacío.</span>
                    }
                  </div>

                  <div class="field col-span-2">
                    <label for="titulo">Título <span class="opt">(opcional)</span></label>
                    <input
                      id="titulo"
                      class="input"
                      type="text"
                      maxlength="100"
                      placeholder="Ej. Bienvenido a Movies+"
                      formControlName="titulo"
                      [class.invalid]="invalid('titulo')"
                    />
                    @if (invalid('titulo')) {
                      <span class="field-err">Máximo 100 caracteres.</span>
                    }
                  </div>

                  <div class="field col-span-2">
                    <label for="descripcion">Descripción <span class="opt">(opcional)</span></label>
                    <textarea
                      id="descripcion"
                      class="input"
                      rows="3"
                      placeholder="Ej. Disfrutá un 10% de descuento en tu primer compra"
                      formControlName="descripcion"
                      [class.invalid]="invalid('descripcion')"
                    ></textarea>
                    @if (invalid('descripcion')) {
                      <span class="field-err">Ingresa una descripción válida.</span>
                    }
                  </div>
                </div>
              </section>

              <section class="card preview-card">
                <div class="card-title">Vista previa</div>

                <div class="coupon">
                  <div class="coupon-top">
                    <span class="coupon-mark">
                      <svg lucideGift [size]="18"></svg>
                    </span>
                    <div class="coupon-code">{{ codigoDisplay() }}</div>
                  </div>
                  <div class="coupon-value">{{ valorDisplay() }}</div>
                  <div class="coupon-foot">
                    <div>
                      <div class="cf-lbl">Vence</div>
                      <div class="cf-val">{{ fechaDisplay() }}</div>
                    </div>
                    <div>
                      <div class="cf-lbl">Usos máx.</div>
                      <div class="cf-val">{{ usosDisplay() }}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            @if (formError(); as msg) {
              <div class="alert">
                <svg lucideTriangleAlert [size]="14"></svg>
                <span>{{ msg }}</span>
              </div>
            }

            <div class="foot">
              <a class="btn" routerLink="/admin/cupones">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="saving() || form.invalid"
              >
                {{ saving() ? 'Guardando…' : 'Crear cupón' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styleUrl: './cupon-form.component.scss',
})
export class AdminCuponFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cuponesSvc = inject(CuponesService);
  private toast = inject(ToastService);

  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly minDate = this.todayISODate();

  readonly form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(24)]],
    tipo: ['porcentaje', Validators.required],
    valor: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    fecha_expiracion: ['', Validators.required],
    usos_maximos: [null as number | null, [Validators.min(1)]],
    titulo: ['', [Validators.maxLength(100)]],
    descripcion: [''],
  });

  constructor() {
    this.form.get('tipo')!.valueChanges.subscribe((tipo) => {
      const valor = this.form.get('valor')!;
      const base = [Validators.required, Validators.min(1)];
      valor.setValidators(
        tipo === 'porcentaje' ? [...base, Validators.max(100)] : base,
      );
      valor.updateValueAndValidity();
    });
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  esPorcentaje(): boolean {
    return this.form.value.tipo === 'porcentaje';
  }

  codigoDisplay(): string {
    return (this.form.value.codigo || '').trim().toUpperCase() || 'CÓDIGO';
  }

  valorDisplay(): string {
    const v = Number(this.form.value.valor);
    if (!v || v <= 0) return '—';
    return this.esPorcentaje() ? `${v}% OFF` : `L ${v} OFF`;
  }

  fechaDisplay(): string {
    const f = this.form.value.fecha_expiracion;
    if (!f) return '—';
    return new Date(`${f}T00:00:00`).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  usosDisplay(): string {
    const u = this.form.value.usos_maximos;
    return u === null || u === '' || u === undefined ? 'Ilimitado' : String(u);
  }

  submit() {
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    const usos =
      v.usos_maximos === null || v.usos_maximos === '' || v.usos_maximos === undefined
        ? null
        : Number(v.usos_maximos);

    this.saving.set(true);
    this.cuponesSvc
      .create({
        codigo: (v.codigo as string).trim().toUpperCase(),
        tipo: v.tipo as 'porcentaje' | 'monto',
        valor: Number(v.valor),
        fecha_expiracion: new Date(`${v.fecha_expiracion}T00:00:00`).toISOString(),
        usos_maximos: usos,
      })
      .subscribe({
        next: (cupon) => {
          this.saving.set(false);
          this.toast.show(`Cupón ${cupon.codigo} creado`);
          this.router.navigate(['/admin/cupones']);
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(extractMessage(err));
        },
      });
  }

  private todayISODate(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
