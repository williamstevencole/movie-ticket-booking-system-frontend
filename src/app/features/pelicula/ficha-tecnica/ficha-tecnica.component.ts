import { Component, Input } from '@angular/core';
import { FichaTecnica } from '../../../mocks/data/cartelera-display.mock';

type Row = { role: string; value: string };

@Component({
  selector: 'app-ficha-tecnica',
  standalone: true,
  template: `
    <div class="crew-block">
      <h3>Ficha técnica</h3>
      <div class="crew-table">
        @for (row of rows(); track row.role) {
          <div class="crew-line">
            <span class="role">{{ row.role }}</span>
            <span class="value">{{ row.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './ficha-tecnica.component.scss',
})
export class FichaTecnicaComponent {
  @Input({ required: true }) ficha!: FichaTecnica;
  @Input() repartoMax = 3;

  rows(): Row[] {
    const f = this.ficha;
    const out: Row[] = [];
    const add = (role: string, value?: string | string[]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      if (Array.isArray(value)) {
        const shown =
          value.length > this.repartoMax
            ? value.slice(0, this.repartoMax).join(', ') + '…'
            : value.join(', ');
        out.push({ role, value: shown });
      } else if (value.trim()) {
        out.push({ role, value });
      }
    };
    add('Dirección', f.direccion);
    add('Guion', f.guion);
    add('Fotografía', f.fotografia);
    add('Reparto principal', f.reparto);
    add('Música', f.musica);
    add('País', f.pais);
    add('Productora', f.productora);
    add('Distribuidor', f.distribuidor);
    return out;
  }
}
