import { Component, inject } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { MOCK_PROMOS } from '../../../mocks/data/promos.mock';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [LucideArrowRight],
  template: `
    <section class="section wrap">
      <div class="section-head">
        <h2>Promociones del mes</h2>
        <a class="link">Ver todas <svg lucideArrowRight [size]="14"></svg></a>
      </div>
      <div class="promo-strip">
        @for (p of promos; track p.id) {
          <article class="promo" [class]="p.variant">
            <div>
              <div class="kicker">{{ p.kicker }}</div>
              <h3>{{ p.titulo }}</h3>
              <p>{{ p.descripcion }}</p>
            </div>
            <button type="button" class="more" (click)="onCta(p)">
              {{ p.cta }}
            </button>
          </article>
        }
      </div>
    </section>
  `,
  styleUrl: './promos.component.scss',
})
export class PromosComponent {
  private toast = inject(ToastService);
  readonly promos = MOCK_PROMOS;

  onCta(p: (typeof MOCK_PROMOS)[number]): void {
    if (p.codigo) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(p.codigo).then(() => {
          this.toast.show(`Código ${p.codigo} copiado al portapapeles`);
        });
      }
    }
  }
}
