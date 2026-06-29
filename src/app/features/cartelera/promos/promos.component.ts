import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCopy, LucideCheck } from '@lucide/angular';
import { Cupon, CuponesService } from '../../../shared/services/cupones.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideCopy, LucideCheck],
  template: `
    @if (cupones().length > 0) {
      <section class="section wrap">
        <div class="section-head">
          <h2>Promociones del mes</h2>
          <a class="link" routerLink="/cupones">
            Ver todos <svg lucideArrowRight [size]="14"></svg>
          </a>
        </div>
        <div class="promo-strip">
          @for (c of cupones(); track c.id) {
            <article class="promo">
              <div>
                <div class="kicker">{{ formatTipo(c) }}</div>
                <h3>{{ c.titulo ?? defaultTitulo(c) }}</h3>
                @if (c.descripcion) {
                  <p>{{ c.descripcion }}</p>
                } @else {
                  <p>Aplicalo al pagar tus boletos.</p>
                }
              </div>
              <button
                type="button"
                class="more"
                (click)="copiar(c)"
              >
                @if (copiados().has(c.id)) {
                  <svg lucideCheck [size]="14"></svg>
                  Copiado
                } @else {
                  <svg lucideCopy [size]="14"></svg>
                  Copiar {{ c.codigo }}
                }
              </button>
            </article>
          }
        </div>
      </section>
    }
  `,
  styleUrl: './promos.component.scss',
})
export class PromosComponent implements OnInit {
  private readonly cuponesSvc = inject(CuponesService);
  private readonly toast = inject(ToastService);

  readonly cupones = signal<Cupon[]>([]);
  readonly copiados = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.cuponesSvc.list().subscribe({
      next: (list) => {
        const ahora = Date.now();
        const activos = list.filter((c) => {
          if (!c.activo) return false;
          if (new Date(c.fecha_expiracion).getTime() < ahora) return false;
          if (c.usos_maximos !== null && c.usos_actuales >= c.usos_maximos) return false;
          return true;
        });
        this.cupones.set(activos.slice(0, 3));
      },
      error: () => this.cupones.set([]),
    });
  }

  copiar(c: Cupon): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(c.codigo).then(() => {
      const next = new Set(this.copiados());
      next.add(c.id);
      this.copiados.set(next);
      this.toast.show(`Código ${c.codigo} copiado`);
      setTimeout(() => {
        const after = new Set(this.copiados());
        after.delete(c.id);
        this.copiados.set(after);
      }, 1800);
    });
  }

  formatTipo(c: Cupon): string {
    return String(c.tipo).toLowerCase().includes('porc') ? 'Descuento %' : 'Monto fijo';
  }

  defaultTitulo(c: Cupon): string {
    const valor = typeof c.valor === 'string' ? Number(c.valor) : c.valor;
    return String(c.tipo).toLowerCase().includes('porc')
      ? `${valor}% de descuento`
      : `L ${valor} de descuento`;
  }
}
