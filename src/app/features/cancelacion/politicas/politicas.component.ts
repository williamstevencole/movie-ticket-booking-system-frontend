import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Boleto } from '../../../shared/services/boletos.service';
import { PoliticaCancelacion, ReglaPolitica } from '../../../shared/services/politicas-cancelacion.service';

type ReglaDisplay = { rango: string; descripcion: string; reembolso: number };

@Component({
  selector: 'app-politicas-cancelacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.scss',
})
export class PoliticasComponent {
  @Input() boleto!: Boleto;
  @Input() politica: PoliticaCancelacion | null = null;
  @Input() reglaAplicable: ReglaPolitica | null = null;
  @Input() cancelando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  readonly verTodas = signal(false);

  get reglaActiva(): ReglaDisplay | null {
    const r = this.reglaAplicable;
    if (!r) return null;
    return this.toDisplay(r);
  }

  get reglas(): ReglaDisplay[] {
    if (!this.politica?.reglas?.length) {
      return [
        { rango: '+24h', descripcion: 'Más de 24h antes de la función', reembolso: 100 },
        { rango: '12-24h', descripcion: 'Entre 12 y 24h antes', reembolso: 50 },
        { rango: '<12h', descripcion: 'Menos de 12h antes', reembolso: 0 },
      ];
    }
    return this.politica.reglas.map((r) => this.toDisplay(r));
  }

  private toDisplay(r: ReglaPolitica): ReglaDisplay {
    return {
      rango: r.horas_antes_maximo === null
        ? `+${r.horas_antes_minimo}h`
        : `${r.horas_antes_minimo}-${r.horas_antes_maximo}h`,
      descripcion: r.horas_antes_maximo === null
        ? `Más de ${r.horas_antes_minimo}h antes de la función`
        : `Entre ${r.horas_antes_minimo}h y ${r.horas_antes_maximo}h antes`,
      reembolso: r.porcentaje_reembolso,
    };
  }

  cerrarModal() {
    if (this.cancelando) return;
    this.cerrar.emit();
  }

  continuarCancelacion() {
    if (this.cancelando) return;
    this.confirmar.emit();
  }

  toggleVerTodas() {
    this.verTodas.update((v) => !v);
  }
}
