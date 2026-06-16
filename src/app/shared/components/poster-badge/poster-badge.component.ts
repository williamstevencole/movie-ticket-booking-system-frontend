import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeTipo } from '../../../mocks/data/cartelera-display.mock';

@Component({
  selector: 'app-poster-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (resolved(); as b) {
      <span
        class="poster-badge"
        [class]="b.cls"
        [class.mini-hidden]="mini"
      >{{ b.label }}</span>
    }
  `,
  styles: `
    .poster-badge {
      position: absolute;
      top: var(--s3, 12px);
      left: var(--s3, 12px);
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      border-radius: 4px;
      z-index: 2;
      white-space: nowrap;
    }
    .estreno { background: var(--red); color: white; }
    .ultima { background: var(--ink); color: white; }
    .vip { background: var(--orange); color: white; }
    .fecha { background: rgba(0, 0, 0, 0.7); color: white; }
    .mini-hidden { display: none; }
  `,
})
export class PosterBadgeComponent {
  @Input({ required: true }) tipo!: BadgeTipo | null;
  @Input() fecha?: string;
  @Input() mini = false;

  resolved(): { label: string; cls: string } | null {
    const t = this.tipo;
    if (!t) return this.fecha ? { label: this.fecha, cls: 'fecha' } : null;
    const map: Record<BadgeTipo, { label: string; cls: string }> = {
      estreno: { label: 'ESTRENO', cls: 'estreno' },
      ultima: { label: 'ÚLT. SEM', cls: 'ultima' },
      vip: { label: 'VIP', cls: 'vip' },
      fecha: { label: this.fecha ?? '', cls: 'fecha' },
    };
    const b = map[t];
    if (t === 'fecha' && !this.fecha) return null;
    return b;
  }
}
