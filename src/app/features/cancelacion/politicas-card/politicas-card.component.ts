import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Regla = { rango: string; descripcion: string; reembolso: string };

@Component({
  selector: 'app-politicas-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politicas-card.component.html',
  styleUrl: './politicas-card.component.scss',
})
export class PoliticasCardComponent {
  readonly reglas: Regla[] = [
    { rango: '+24h', descripcion: 'Más de 24h antes de la función', reembolso: '100%' },
    { rango: '12-24h', descripcion: 'Entre 12 y 24h antes', reembolso: '50%' },
    { rango: '<12h', descripcion: 'Menos de 12h antes', reembolso: '0%' },
  ];
}
