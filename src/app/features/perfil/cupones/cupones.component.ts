import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideCopy, LucideCheck, LucideClock } from '@lucide/angular';
import { Cupon, CuponesService } from '../../../shared/services/cupones.service';
import { ToastService } from '../../../shared/services/toast.service';

interface CuponView extends Cupon {
  diasRestantes: number;
  porVencer: boolean;
  porcentaje: boolean;
  copiado: boolean;
}

@Component({
  selector: 'app-perfil-cupones',
  standalone: true,
  imports: [RouterLink, LucideCopy, LucideCheck, LucideClock, DatePipe],
  template: `
    <div class="panel">
      <h2>Mis cupones</h2>
      @if (loading()) {
        <p class="sub">Cargando…</p>
      } @else if (cupones().length === 0) {
        <div class="empty">
          <p>No tienes cupones activos</p>
          <a routerLink="/cartelera" class="link">Ver promociones →</a>
        </div>
      } @else {
        <div class="cupon-list">
          @for (c of cupones(); track c.id) {
            <article class="cupon-card" [class.warn]="c.porVencer">
              <div class="top">
                <span class="code">{{ c.codigo }}</span>
                @if (c.porVencer) {
                  <span class="pill warn">
                    <svg lucideClock [size]="12"></svg>
                    Vence en {{ c.diasRestantes }} días
                  </span>
                }
              </div>
              <p class="desc">Cupón {{ c.codigo }} — válido hasta {{ c.fecha_expiracion | date:'d MMM y' }}</p>
              <div class="foot">
                <span class="val">
                  @if (c.porcentaje) {
                    {{ c.valor }}% de descuento
                  } @else {
                    L {{ c.valor }} de descuento
                  }
                </span>
                <span class="uses">
                  @if (c.usos_maximos !== null) {
                    {{ c.usos_maximos - c.usos_actuales }} usos restantes
                  }
                </span>
                <button type="button" class="btn btn-sm" (click)="copy(c)">
                  @if (c.copiado) {
                    <svg lucideCheck [size]="14"></svg> Copiado
                  } @else {
                    <svg lucideCopy [size]="14"></svg> Copiar código
                  }
                </button>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './cupones.component.scss',
})
export class PerfilCuponesComponent implements OnInit {
  private cuponesSvc = inject(CuponesService);
  private toast = inject(ToastService);

  readonly cupones = signal<CuponView[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cuponesSvc.list().subscribe({
      next: (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const list = data
          .filter((c) => c.activo)
          .map((c) => {
            const exp = new Date(c.fecha_expiracion);
            const dias = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
            return {
              ...c,
              diasRestantes: dias,
              porVencer: dias <= 7 && dias >= 0,
              porcentaje: String(c.tipo).toLowerCase().includes('porc'),
              copiado: false,
            };
          });
        this.cupones.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.cupones.set([]);
        this.loading.set(false);
      },
    });
  }

  copy(c: CuponView): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(c.codigo).then(() => {
      this.cupones.update((list) =>
        list.map((x) => (x.id === c.id ? { ...x, copiado: true } : x)),
      );
      this.toast.show('Copiado');
      setTimeout(() => {
        this.cupones.update((list) =>
          list.map((x) => (x.id === c.id ? { ...x, copiado: false } : x)),
        );
      }, 1500);
    });
  }
}
