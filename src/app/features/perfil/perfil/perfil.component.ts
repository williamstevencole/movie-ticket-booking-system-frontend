import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="panel">
      <h2>Mi perfil</h2>
      <p class="sub">Actualizá tu información personal.</p>
      <form [formGroup]="form" (ngSubmit)="save()" class="form">
        <div class="field">
          <label for="nombre">Nombre completo</label>
          <input id="nombre" class="input" formControlName="nombre" />
        </div>
        <div class="field">
          <label for="email">Correo electrónico</label>
          <input id="email" class="input" type="email" formControlName="email" readonly />
          <span class="help">El correo no se puede cambiar desde aquí.</span>
        </div>
        <div class="field">
          <label for="telefono">Teléfono</label>
          <input id="telefono" class="input" formControlName="telefono" placeholder="+504 0000-0000" />
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar cambios</button>
      </form>
    </div>
  `,
  styleUrl: './perfil.component.scss',
})
export class PerfilPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.auth.user()?.nombre ?? '', Validators.required],
    email: [{ value: this.auth.user()?.email ?? '', disabled: true }],
    telefono: [''],
  });

  save(): void {
    if (this.form.invalid) return;
    this.toast.show('Perfil actualizado (mock)');
  }
}
