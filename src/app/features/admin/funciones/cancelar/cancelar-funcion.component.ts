import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideTriangleAlert } from '@lucide/angular';

import {
  Funcion,
  FuncionesService,
} from '../../../../shared/services/funciones.service';
import {
  Pelicula,
  PeliculasService,
} from '../../../../shared/services/peliculas.service';
import {
  Cine,
  CinesService,
} from '../../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;

@Component({
  selector: 'app-admin-cancelar-funcion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    AdminSidebarComponent,
    LucideTriangleAlert,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/funciones">Funciones</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Cancelar</span>
          </div>

          <div class="head-row">
            <h1>Cancelar función</h1>
            <p class="lead">
              Revisa el impacto antes de confirmar. La cancelación dispara reembolsos a los clientes con boletos pagados.
            </p>
          </div>

          @if (funcion()) {
            <div class="warning-hero">
              <span class="warning-icon">
                <svg lucideTriangleAlert [size]="20"></svg>
              </span>
              <div class="warning-text">
                Esta acción es <strong>irreversible</strong>.
                Una vez cancelada, la función no podrá reactivarse desde esta pantalla.
                Si necesitas regresarla, créala de nuevo desde el listado.
              </div>
            </div>

            <section class="card">
              <div class="card-title">Función</div>
              <div class="info-grid">
                <div class="info-row">
                  <span class="label">Película</span>
                  <span class="value">{{ pelicula()?.titulo ?? '—' }}</span>
                  <span class="value-sub">
                    {{ pelicula()?.duracion_min ?? 0 }} min · {{ pelicula()?.clasificacion }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Cuándo</span>
                  <span class="value tnum">
                    {{ funcion()!.fecha_inicio | date: 'EEEE d MMM' }}
                  </span>
                  <span class="value-sub tnum">
                    {{ funcion()!.fecha_inicio | date: 'HH:mm' }} · faltan {{ horasFaltantes() }}h
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Cine</span>
                  <span class="value">{{ cine()?.nombre ?? '—' }}</span>
                  <span class="value-sub">Sala {{ salaNombre() }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Precio base</span>
                  <span class="value tnum">L {{ funcion()!.precio_base }}</span>
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card-title">Impacto</div>

              <div class="totals">
                <div class="total">
                  <span class="total-label">Boletos vendidos</span>
                  <span class="total-value tnum">{{ funcion()!.boletos_vendidos }}</span>
                </div>
                <div class="total refund">
                  <span class="total-label">Monto a reembolsar</span>
                  <span class="total-value tnum">L {{ montoReembolso() }}</span>
                </div>
                <div class="total">
                  <span class="total-label">Monto retenido</span>
                  <span class="total-value tnum">L {{ montoRetenido() }}</span>
                </div>
              </div>

              <div class="policy-row">
                <div>
                  <div class="policy-tag">Política aplicada</div>
                  <div style="font-size: 14px; color: var(--text-2); margin-top: 2px;">
                    {{ policyLabel() }}
                  </div>
                </div>
                <span class="policy-pct tnum">{{ refundPct() }}%</span>
              </div>
            </section>

            <section class="card">
              <div class="foot">
                <label class="confirm-side">
                  <input type="checkbox" [(ngModel)]="confirmado" />
                  Entiendo que esta acción no se puede deshacer
                </label>
                <div style="display: inline-flex; gap: var(--s3);">
                  <a class="btn" routerLink="/admin/funciones">Volver</a>
                  <button
                    type="button"
                    class="btn-danger"
                    [disabled]="!confirmado || saving()"
                    (click)="confirmar()"
                  >
                    {{ saving() ? 'Cancelando…' : 'Cancelar función' }}
                  </button>
                </div>
              </div>
            </section>
          } @else if (errorMsg()) {
            <section class="card">
              <p style="color: var(--text-2);">{{ errorMsg() }}</p>
              <a routerLink="/admin/funciones" class="btn" style="margin-top: var(--s4);">
                Volver al listado
              </a>
            </section>
          }
        </div>
      </main>
    </div>

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './cancelar-funcion.component.scss',
})
export class AdminCancelarFuncionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);

  readonly funcion = signal<Funcion | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);
  readonly cine = signal<Cine | null>(null);
  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly toast = signal<Toast>(null);

  confirmado = false;

  readonly horasFaltantes = computed(() => {
    const f = this.funcion();
    if (!f) return 0;
    const diffMs = new Date(f.fecha_inicio).getTime() - Date.now();
    return Math.max(0, Math.round(diffMs / 3_600_000));
  });

  readonly refundPct = computed(() => {
    const h = this.horasFaltantes();
    if (h >= 24) return 100;
    if (h >= 6) return 50;
    return 0;
  });

  readonly policyLabel = computed(() => {
    const pct = this.refundPct();
    if (pct === 100) return 'Faltan más de 24h: reembolso completo';
    if (pct === 50) return 'Faltan entre 6 y 24h: reembolso parcial';
    return 'Faltan menos de 6h: no aplica reembolso';
  });

  readonly montoReembolso = computed(() => {
    const f = this.funcion();
    if (!f) return 0;
    return Math.round(f.boletos_vendidos * f.precio_base * (this.refundPct() / 100));
  });

  readonly montoRetenido = computed(() => {
    const f = this.funcion();
    if (!f) return 0;
    return f.boletos_vendidos * f.precio_base - this.montoReembolso();
  });

  readonly salaNombre = computed(() => {
    const f = this.funcion();
    const c = this.cine();
    if (!f || !c) return '—';
    return c.salas.find((s) => s.id === f.id_sala)?.nombre ?? '—';
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg.set('No se especificó el ID de la función');
      return;
    }
    this.funcionesSvc.getById(id).subscribe({
      next: (f) => {
        if (f.estado !== 'programada') {
          this.errorMsg.set(`Esta función está ${f.estado}, no se puede cancelar.`);
          return;
        }
        this.funcion.set(f);
        this.peliculasSvc.getById(f.id_pelicula).subscribe({
          next: (p) => this.pelicula.set(p),
        });
        this.cinesSvc.getById(f.id_cine).subscribe({
          next: (c) => this.cine.set(c),
        });
      },
      error: () => this.errorMsg.set('No se encontró la función'),
    });
  }

  confirmar() {
    const f = this.funcion();
    if (!f || !this.confirmado) return;
    this.saving.set(true);
    this.funcionesSvc.cancelar(f.id).subscribe({
      next: () => {
        this.saving.set(false);
        const reembolso = this.montoReembolso();
        const msg = reembolso > 0
          ? `Función cancelada. Reembolso: L ${reembolso}`
          : 'Función cancelada';
        this.router.navigate(['/admin/funciones'], { state: { toast: msg } });
      },
      error: (e) => {
        this.saving.set(false);
        this.showToast('err', e?.message ?? 'No se pudo cancelar la función');
      },
    });
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
