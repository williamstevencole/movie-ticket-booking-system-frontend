import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UsuariosService } from '../../../shared/services/usuarios.service';

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
          <input
            id="email"
            class="input"
            type="email"
            formControlName="email"
            readonly
          />
          <span class="help">El correo no se puede cambiar desde aquí.</span>
        </div>
        <div class="field">
          <label for="telefono">Teléfono</label>
          <input
            id="telefono"
            class="input"
            formControlName="telefono"
            placeholder="+504 0000-0000"
          />
        </div>
        <div class="field">
          <label for="notif">
            <input
              id="notif"
              type="checkbox"
              [checked]="notificacionesActivas"
              (change)="toggleNotificaciones($any($event.target).checked)"
            />
            Recibir notificaciones por email
          </label>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
          Guardar cambios
        </button>
      </form>
    </div>
  `,
  styleUrl: './perfil.component.scss',
})
export class PerfilPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private usuariosSvc = inject(UsuariosService);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.auth.user()?.nombre ?? '', Validators.required],
    email: [{ value: this.auth.user()?.email ?? '', disabled: true }],
    telefono: [''],
  });

  notificacionesActivas = this.auth.user()?.notificaciones_activas ?? false;

  save(): void {
    if (this.form.invalid) return;

    const datos = this.form.getRawValue();

    this.usuariosSvc
      .actualizarMiPerfil({
        nombre: datos.nombre,
        telefono: datos.telefono,
      })
      .subscribe({
        next: (usuarioActualizado) => {
          this.auth.updateUser(usuarioActualizado);
          this.toast.show('Perfil actualizado correctamente');
        },
        error: () => {
          this.toast.show('No se pudo actualizar el perfil');
        },
      });
  }

  toggleNotificaciones(activa: boolean): void {
    const prev = this.notificacionesActivas;
    this.notificacionesActivas = activa;

    this.usuariosSvc
      .actualizarMiPerfil({
        notificaciones_activas: activa,
      })
      .subscribe({
        next: (usuarioActualizado) => {
          this.auth.updateUser(usuarioActualizado);

          this.toast.show(
            activa ? 'Notificaciones activadas' : 'Notificaciones desactivadas',
          );
        },
        error: () => {
          this.notificacionesActivas = prev;
          this.toast.show('No se pudo guardar la preferencia');
        },
      });
  }
}
