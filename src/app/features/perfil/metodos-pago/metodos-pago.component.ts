import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { MOCK_METODOS_PAGO, MetodoPago } from '../../../mocks/data/perfil.mock';

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
                <span class="brand">{{ t.marca }}</span>
                <span class="digits">•••• {{ t.ultimos4 }}</span>
                @if (t.predeterminada) {
                  <span class="pill red-soft">Predeterminada</span>
                }
                <div class="exp">Expira {{ t.expiracion }}</div>
              </div>
              <div class="actions">
                @if (!t.predeterminada) {
                  <button type="button" class="btn btn-sm" (click)="setDefault(t)">
                    Predeterminada
                  </button>
                }
                <button type="button" class="btn btn-sm btn-danger" (click)="askDelete(t)">
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
          <h3>Nueva tarjeta (mock)</h3>
          <div class="field">
            <label>Número de tarjeta</label>
            <input class="input" formControlName="numero" placeholder="4242 4242 4242 4242" />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Expiración</label>
              <input class="input" formControlName="expiracion" placeholder="MM/AA" />
            </div>
            <div class="field">
              <label>Marca</label>
              <select class="input" formControlName="marca">
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn" (click)="showForm.set(false)">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
          </div>
        </form>
      }

      @if (pendingDelete(); as t) {
        <div class="confirm">
          <p>¿Eliminar tarjeta {{ t.marca }} •••• {{ t.ultimos4 }}?</p>
          <div class="actions">
            <button type="button" class="btn" (click)="pendingDelete.set(null)">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()">Eliminar</button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './metodos-pago.component.scss',
})
export class MetodosPagoPageComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  readonly tarjetas = signal<MetodoPago[]>([...MOCK_METODOS_PAGO]);
  readonly showForm = signal(false);
  readonly pendingDelete = signal<MetodoPago | null>(null);

  readonly form = this.fb.nonNullable.group({
    numero: ['', [Validators.required, Validators.minLength(15)]],
    expiracion: ['', Validators.required],
    marca: ['Visa' as MetodoPago['marca'], Validators.required],
  });

  setDefault(t: MetodoPago): void {
    this.tarjetas.update((list) =>
      list.map((x) => ({ ...x, predeterminada: x.id === t.id })),
    );
    this.toast.show('Tarjeta predeterminada actualizada');
  }

  askDelete(t: MetodoPago): void {
    this.pendingDelete.set(t);
  }

  confirmDelete(): void {
    const t = this.pendingDelete();
    if (!t) return;
    this.tarjetas.update((list) => list.filter((x) => x.id !== t.id));
    this.pendingDelete.set(null);
    this.toast.show('Tarjeta eliminada');
  }

  addCard(): void {
    if (this.form.invalid) return;
    const { numero, expiracion, marca } = this.form.getRawValue();
    const ultimos4 = numero.replace(/\s/g, '').slice(-4);
    this.tarjetas.update((list) => [
      ...list,
      {
        id: 'mp-' + Date.now(),
        marca,
        ultimos4,
        expiracion,
        predeterminada: list.length === 0,
      },
    ]);
    this.form.reset({ marca: 'Visa' });
    this.showForm.set(false);
    this.toast.show('Tarjeta agregada (mock)');
  }
}
