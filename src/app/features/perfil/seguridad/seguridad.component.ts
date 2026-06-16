import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-seguridad-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="stack">
      <section class="panel">
        <h2>Cambiar contraseña</h2>
        <form [formGroup]="pwForm" (ngSubmit)="changePassword()" class="form">
          <div class="field">
            <label for="actual">Contraseña actual</label>
            <input id="actual" type="password" class="input" formControlName="actual" />
          </div>
          <div class="field">
            <label for="nueva">Nueva contraseña</label>
            <input id="nueva" type="password" class="input" formControlName="nueva" />
          </div>
          <div class="field">
            <label for="confirm">Confirmar nueva contraseña</label>
            <input id="confirm" type="password" class="input" formControlName="confirm" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="pwForm.invalid">
            Actualizar contraseña
          </button>
        </form>
      </section>

      <section class="panel danger">
        <h2>Eliminar cuenta</h2>
        <p class="sub">Esta acción es permanente. Se eliminarán tus boletos, cupones y métodos de pago.</p>
        @if (!confirmDelete()) {
          <button type="button" class="btn btn-danger" (click)="confirmDelete.set(true)">
            Eliminar mi cuenta
          </button>
        } @else {
          <form [formGroup]="deleteForm" (ngSubmit)="deleteAccount()" class="form">
            <div class="field">
              <label for="emailConfirm">Escribí tu correo para confirmar</label>
              <input id="emailConfirm" class="input" formControlName="email" [placeholder]="userEmail" />
            </div>
            <div class="actions">
              <button type="button" class="btn" (click)="confirmDelete.set(false)">Cancelar</button>
              <button type="submit" class="btn btn-danger" [disabled]="deleteForm.invalid">
                Confirmar eliminación
              </button>
            </div>
          </form>
        }
      </section>
    </div>
  `,
  styleUrl: './seguridad.component.scss',
})
export class SeguridadPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly confirmDelete = signal(false);
  readonly userEmail = this.auth.user()?.email ?? '';

  readonly pwForm = this.fb.nonNullable.group({
    actual: ['', Validators.required],
    nueva: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  });

  readonly deleteForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
  });

  changePassword(): void {
    if (this.pwForm.invalid) return;
    const { nueva, confirm } = this.pwForm.getRawValue();
    if (nueva !== confirm) {
      this.toast.show('Las contraseñas no coinciden');
      return;
    }
    this.toast.show('Contraseña actualizada (mock)');
    this.pwForm.reset();
  }

  deleteAccount(): void {
    const email = this.deleteForm.getRawValue().email;
    if (email !== this.userEmail) {
      this.toast.show('El correo no coincide');
      return;
    }
    this.toast.show('Cuenta eliminada (mock)');
    this.confirmDelete.set(false);
  }
}
