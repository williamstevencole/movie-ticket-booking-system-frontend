import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliticaCancelacion } from '../../../shared/services/politicas-cancelacion.service';

type ReglaDisplay = { rango: string; descripcion: string; reembolso: string };

@Component({
  selector: 'app-politicas-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politicas-card.component.html',
  styleUrl: './politicas-card.component.scss',
})
export class PoliticasCardComponent {
  @Input() politica: PoliticaCancelacion | null = null;

  get reglas(): ReglaDisplay[] {
    if (!this.politica?.reglas?.length) {
      return [
        { rango: '+24h', descripcion: 'Más de 24h antes de la función', reembolso: '100%' },
        { rango: '12-24h', descripcion: 'Entre 12 y 24h antes', reembolso: '50%' },
        { rango: '<12h', descripcion: 'Menos de 12h antes', reembolso: '0%' },
      ];
    }
    return this.politica.reglas.map((r) => ({
      rango: r.horas_antes_maximo === null
        ? `+${r.horas_antes_minimo}h`
        : `${r.horas_antes_minimo}-${r.horas_antes_maximo}h`,
      descripcion: r.horas_antes_maximo === null
        ? `Más de ${r.horas_antes_minimo}h antes de la función`
        : `Entre ${r.horas_antes_minimo}h y ${r.horas_antes_maximo}h antes`,
      reembolso: `${r.porcentaje_reembolso}%`,
    }));
  }
}
