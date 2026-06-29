import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliticaCancelacion, ReglaPolitica } from '../../../shared/services/politicas-cancelacion.service';

type ReglaDisplay = { rango: string; descripcion: string; reembolso: number };

@Component({
  selector: 'app-politicas-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politicas-card.component.html',
  styleUrl: './politicas-card.component.scss',
})
export class PoliticasCardComponent {
  @Input() politica: PoliticaCancelacion | null = null;
  @Input() reglaAplicable: ReglaPolitica | null = null;

  readonly modalAbierto = signal(false);

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

  abrirModal(): void { this.modalAbierto.set(true); }
  cerrarModal(): void { this.modalAbierto.set(false); }
}
