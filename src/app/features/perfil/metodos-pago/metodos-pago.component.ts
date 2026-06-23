import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import {
  MetodosPagoService,
  MetodoPago,
} from '../../../shared/services/metodos-pago.service';

@Component({
  selector: 'app-metodos-pago-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="panel">
      <h2>Métodos de pago</h2>

      @if (tarjetas().length === 0) {
        <div class="empty">
          <p>No tienes tarjetas guardadas</p>
          <button type="button" class="btn btn-primary" (click)="showForm.set(true)">
            + Agregar tarjeta
          </button>
        </div>
      } @else {
        <ul class="cards">
          @for (t of tarjetas(); track t.id) {
            <li class="card-row">
              <div>
                <span class="brand">{{ t.marca ?? 'Tarjeta' }}</span>
                <span class="digits">•••• {{ t.ultimos4 }}</span>
                @if (t.predeterminado) {
                  <span class="pill red-soft">Predeterminada</span>
                }
                <div class="exp">Expira {{ t.expiracion }}</div>
                @if (t.titular) {
                  <div class="exp">{{ t.titular }}</div>
                }
              </div>
              <div class="actions">
                @if (!t.predeterminado) {
                  <button type="button" class="btn btn-sm" (click)="setDefault(t)" [disabled]="loading()">
                    Predeterminada
                  </button>
                }
                <button type="button" class="btn btn-sm btn-danger" (click)="askDelete(t)" [disabled]="loading()">
                  Eliminar
                </button>
              </div>
            </li>
          }
        </ul>
        <button type="button" class="btn add" (click)="showForm.set(true)">+ Agregar tarjeta</button>
      }

      @if (showForm()) {
        <form [formGroup]="form" (ngSubmit)="addCard()" class="add-form">
          <h3>Nueva tarjeta</h3>
          <div class="field">
            <label>Nombre del titular</label>
            <input class="input" formControlName="titular" placeholder="Como aparece en la tarjeta" />
          </div>
          <div class="field">
            <label>Número de tarjeta</label>
            <input class="input" formControlName="numero" placeholder="4242 4242 4242 4242" maxlength="19" />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Expiración</label>
              <input class="input" formControlName="expiracion" placeholder="MM/AA" maxlength="5" />
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn" (click)="showForm.set(false)">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">Guardar</button>
          </div>
        </form>
      }

      @if (pendingDelete(); as t) {
        <div class="confirm">
          <p>¿Eliminar tarjeta {{ t.marca }} •••• {{ t.ultimos4 }}?</p>
          <div class="actions">
            <button type="button" class="btn" (click)="pendingDelete.set(null)" [disabled]="loading()">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()" [disabled]="loading()">Eliminar</button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './metodos-pago.component.scss',
})
export class MetodosPagoPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private svc = inject(MetodosPagoService);

  readonly tarjetas = signal<MetodoPago[]>([]);
  readonly showForm = signal(false);
  readonly pendingDelete = signal<MetodoPago | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    titular: ['', Validators.required],
    numero: ['', [Validators.required, Validators.minLength(15)]],
    expiracion: ['', Validators.required],
  });

  ngOnInit(): void {
    this.svc.listar().subscribe((list) => this.tarjetas.set(list));
  }

  setDefault(t: MetodoPago): void {
    this.loading.set(true);
    this.svc.marcarPredeterminado(t.id).subscribe({
      next: () => {
        this.tarjetas.update((list) =>
          list.map((x) => ({ ...x, predeterminado: x.id === t.id })),
        );
        this.toast.show('Tarjeta predeterminada actualizada');
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Error al actualizar tarjeta');
        this.loading.set(false);
      },
    });
  }

  askDelete(t: MetodoPago): void {
    this.pendingDelete.set(t);
  }

  confirmDelete(): void {
    const t = this.pendingDelete();
    if (!t) return;
    this.loading.set(true);
    this.svc.borrar(t.id).subscribe({
      next: () => {
        this.tarjetas.update((list) => list.filter((x) => x.id !== t.id));
        this.pendingDelete.set(null);
        this.toast.show('Tarjeta eliminada');
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Error al eliminar tarjeta');
        this.loading.set(false);
      },
    });
  }

  addCard(): void {
    if (this.form.invalid) return;
    const { numero, expiracion, titular } = this.form.getRawValue();
    this.loading.set(true);
    this.svc
      .crear({ tipo: 'tarjeta', numero, expiracion, titular })
      .subscribe({
        next: (mp) => {
          this.tarjetas.update((list) => [...list, mp]);
          this.form.reset();
          this.showForm.set(false);
          this.toast.show('Tarjeta agregada');
          this.loading.set(false);
        },
        error: () => {
          this.toast.show('Error al agregar tarjeta');
          this.loading.set(false);
        },
      });
  }
}
