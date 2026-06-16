import { Component, signal } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { MOCK_NOTIFICACIONES, NotificacionPref } from '../../../mocks/data/perfil.mock';
import { inject } from '@angular/core';

@Component({
  selector: 'app-notificaciones-page',
  standalone: true,
  template: `
    <div class="panel">
      <h2>Notificaciones</h2>
      <p class="sub">Elegí qué avisos querés recibir por correo o push.</p>
      <ul class="prefs">
        @for (n of prefs(); track n.id) {
          <li class="pref-row">
            <div>
              <div class="label">{{ n.label }}</div>
              <div class="desc">{{ n.descripcion }}</div>
            </div>
            <button
              type="button"
              class="toggle"
              [class.on]="n.activa"
              [attr.aria-pressed]="n.activa"
              (click)="toggle(n)"
            >
              <span class="knob"></span>
            </button>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesPageComponent {
  private toast = inject(ToastService);
  readonly prefs = signal<NotificacionPref[]>([...MOCK_NOTIFICACIONES]);

  toggle(n: NotificacionPref): void {
    this.prefs.update((list) =>
      list.map((x) =>
        x.id === n.id ? { ...x, activa: !x.activa } : x,
      ),
    );
    const updated = this.prefs().find((x) => x.id === n.id)!;
    this.toast.show(
      updated.activa
        ? `${n.label} activadas`
        : `${n.label} desactivadas`,
    );
  }
}
