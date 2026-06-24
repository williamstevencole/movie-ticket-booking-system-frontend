import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideUndo2,
  LucideCheck,
  LucideX,
  LucideEye,
  LucideCreditCard,
  LucideBanknote,
  LucideTriangleAlert,
  LucideClock,
} from '@lucide/angular';

import {
  AdminReembolsosService,
  AdminReembolsoRow,
  EstadoReembolsoAdmin,
  ReembolsoAdmin,
} from '../../../shared/services/admin-reembolsos.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';

type Toast = { kind: 'ok' | 'err'; text: string } | null;

type TabDef = { key: EstadoReembolsoAdmin; label: string };

const TABS: TabDef[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'procesando', label: 'Procesando' },
  { key: 'completado', label: 'Completados' },
  { key: 'rechazado', label: 'Rechazados' },
];

@Component({
  selector: 'app-admin-reembolsos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideUndo2,
    LucideCheck,
    LucideX,
    LucideEye,
    LucideCreditCard,
    LucideBanknote,
    LucideTriangleAlert,
    LucideClock,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <header class="topbar">
            <div class="crumb">
              <a routerLink="/admin">Admin</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Reembolsos</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Reembolsos</h1>
                <p class="lead">
                  Procesa los reembolsos en cola según la política aplicada a
                  cada reserva.
                </p>
              </div>
            </div>
          </header>

          <section class="kpis">
            <div class="kpi">
              <span class="kpi-label">Pendientes</span>
              <span class="kpi-value">{{ count('pendiente') }}</span>
            </div>
            <div class="kpi">
              <span class="kpi-label">En procesamiento</span>
              <span class="kpi-value">{{ count('procesando') }}</span>
            </div>
            <div class="kpi kpi-accent">
              <span class="kpi-label">Monto pendiente</span>
              <span class="kpi-value">{{ money(montoPendiente()) }}</span>
            </div>
          </section>

          <section class="tabs" role="tablist">
            @for (t of tabs; track t.key) {
              <button
                class="tab"
                role="tab"
                [class.on]="tab() === t.key"
                [attr.aria-selected]="tab() === t.key"
                (click)="tab.set(t.key)"
              >
                {{ t.label }}
                <span class="tab-count">{{ count(t.key) }}</span>
              </button>
            }
          </section>

          <section class="card">
            @if (filtered().length === 0) {
              <div class="empty">
                <span class="empty-mark">
                  <svg lucideUndo2 [size]="22"></svg>
                </span>
                <h3>Nada por aquí</h3>
                <p>No hay reembolsos en <strong>{{ activeLabel() }}</strong>.</p>
              </div>
            } @else {
              <div class="table-scroll">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Reserva</th>
                      <th>Cliente</th>
                      <th>Película</th>
                      <th class="col-num">Monto</th>
                      <th>Método</th>
                      <th>En cola</th>
                      <th>Política</th>
                      <th class="col-acc" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of filtered(); track r.id) {
                      <tr>
                        <td><span class="mono">{{ r.reserva }}</span></td>
                        <td class="cell-strong">{{ r.cliente }}</td>
                        <td class="muted">{{ r.pelicula }}</td>
                        <td class="col-num">
                          <span class="monto">{{ money(r.monto) }}</span>
                          <span class="pct">{{ r.porcentaje }}%</span>
                        </td>
                        <td>
                          <span class="metodo">
                            @if (r.metodo === 'efectivo') {
                              <svg lucideBanknote [size]="15"></svg>
                            } @else {
                              <svg lucideCreditCard [size]="15"></svg>
                            }
                            <span>{{ r.metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta' }}</span>
                          </span>
                        </td>
                        <td>
                          @if (r.estado === 'pendiente' || r.estado === 'procesando') {
                            <span class="cola" [class.warn]="r.diasEnCola >= 5">
                              <svg lucideClock [size]="14"></svg>
                              {{ r.diasEnCola }}
                              {{ r.diasEnCola === 1 ? 'día' : 'días' }}
                            </span>
                          } @else {
                            <span class="muted">—</span>
                          }
                        </td>
                        <td class="muted politica">{{ r.politica }}</td>
                        <td class="col-acc">
                          <div class="row-acc">
                            @if (r.estado === 'pendiente' || r.estado === 'procesando') {
                              <button
                                class="btn btn-sm btn-primary"
                                (click)="onProcesar(r)"
                              >
                                <svg lucideCheck [size]="14"></svg>
                                <span>{{ procesarLabel(r) }}</span>
                              </button>
                              <button
                                class="icon-btn danger"
                                (click)="askReject(r)"
                                title="Rechazar"
                                aria-label="Rechazar"
                              >
                                <svg lucideX [size]="15"></svg>
                              </button>
                            }
                            <button
                              class="icon-btn"
                              (click)="openDetail(r)"
                              title="Ver detalle"
                              aria-label="Ver detalle"
                            >
                              <svg lucideEye [size]="15"></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        </div>
      </main>
    </div>

    <!-- Confirmación reembolso en efectivo -->
    @if (confirmTarget(); as r) {
      <div class="overlay" (click)="confirmTarget.set(null)">
        <div class="dialog dialog-sm" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Confirmar entrega en efectivo</h2>
            <button class="icon-btn" (click)="confirmTarget.set(null)" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <div class="alert">
              <svg lucideTriangleAlert [size]="14"></svg>
              <span>
                Estás por marcar como entregado un reembolso
                <strong>en efectivo</strong>. Asegúrate de haber entregado
                {{ money(r.monto) }} a <strong>{{ r.cliente }}</strong>.
              </span>
            </div>
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="confirmTarget.set(null)">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmEfectivo()">
              Confirmar entrega
            </button>
          </footer>
        </div>
      </div>
    }

    <!-- Rechazar con motivo -->
    @if (rejectTarget(); as r) {
      <div class="overlay" (click)="closeReject()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Rechazar reembolso</h2>
            <button class="icon-btn" (click)="closeReject()" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <p class="confirm-text">
              Reserva <span class="mono">{{ r.reserva }}</span> ·
              {{ r.cliente }} · {{ money(r.monto) }}
            </p>
            <div class="field mt">
              <label for="motivo">Motivo del rechazo</label>
              <textarea
                id="motivo"
                class="input textarea"
                rows="3"
                maxlength="240"
                placeholder="Explica por qué se rechaza este reembolso…"
                [ngModel]="rejectReason()"
                (ngModelChange)="rejectReason.set($event)"
              ></textarea>
            </div>
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="closeReject()">Cancelar</button>
            <button
              class="btn btn-danger"
              [disabled]="!rejectReason().trim()"
              (click)="submitReject()"
            >
              Rechazar
            </button>
          </footer>
        </div>
      </div>
    }

    <!-- Detalle -->
    @if (detailTarget(); as r) {
      <div class="overlay" (click)="detailTarget.set(null)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="dlg-head">
            <h2>Reembolso {{ r.reserva }}</h2>
            <button class="icon-btn" (click)="detailTarget.set(null)" aria-label="Cerrar">
              <svg lucideX [size]="16"></svg>
            </button>
          </header>
          <div class="dlg-body">
            <dl class="detail">
              <div><dt>Cliente</dt><dd>{{ r.cliente }}</dd></div>
              <div><dt>Película</dt><dd>{{ r.pelicula }}</dd></div>
              <div><dt>Monto</dt><dd>{{ money(r.monto) }} ({{ r.porcentaje }}%)</dd></div>
              <div>
                <dt>Método</dt>
                <dd>{{ r.metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta' }}</dd>
              </div>
              <div><dt>Política</dt><dd>{{ r.politica }}</dd></div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <span class="estado-badge" [class]="'st-' + r.estado">
                    {{ estadoLabel(r.estado) }}
                  </span>
                </dd>
              </div>
              <div><dt>Solicitado</dt><dd>{{ fmtDate(r.created_at) }}</dd></div>
              @if (r.fechaProcesado) {
                <div><dt>Procesado</dt><dd>{{ fmtDate(r.fechaProcesado) }}</dd></div>
              }
              @if (r.motivoRechazo) {
                <div class="full">
                  <dt>Motivo del rechazo</dt>
                  <dd>{{ r.motivoRechazo }}</dd>
                </div>
              }
            </dl>
          </div>
          <footer class="dlg-foot">
            <button class="btn" (click)="detailTarget.set(null)">Cerrar</button>
          </footer>
        </div>
      </div>
    }

    @if (toast(); as t) {
      <div class="toast" [class.ok]="t.kind === 'ok'" [class.err]="t.kind === 'err'">
        {{ t.text }}
      </div>
    }
  `,
  styleUrl: './reembolsos.component.scss',
})
export class AdminReembolsosComponent {
  private svc = inject(AdminReembolsosService);

  readonly tabs = TABS;

  readonly items = signal<ReembolsoAdmin[]>([]);
  readonly tab = signal<EstadoReembolsoAdmin>('pendiente');

  readonly confirmTarget = signal<ReembolsoAdmin | null>(null);
  readonly rejectTarget = signal<ReembolsoAdmin | null>(null);
  readonly rejectReason = signal('');
  readonly detailTarget = signal<ReembolsoAdmin | null>(null);
  readonly toast = signal<Toast>(null);

  readonly filtered = computed(() =>
    this.items().filter((r) => r.estado === this.tab()),
  );

  readonly montoPendiente = computed(() =>
    this.items()
      .filter((r) => r.estado === 'pendiente')
      .reduce((sum, r) => sum + r.monto, 0),
  );

  readonly activeLabel = computed(
    () => TABS.find((t) => t.key === this.tab())?.label ?? '',
  );

  constructor() {
    this.refresh();
  }

  count(estado: EstadoReembolsoAdmin): number {
    return this.items().filter((r) => r.estado === estado).length;
  }

  procesarLabel(r: ReembolsoAdmin): string {
    return r.estado === 'procesando' ? 'Completar' : 'Procesar';
  }

  onProcesar(r: ReembolsoAdmin) {
    // Reembolsos en efectivo requieren confirmación explícita.
    if (r.estado === 'pendiente' && r.metodo === 'efectivo') {
      this.confirmTarget.set(r);
      return;
    }
    this.doProcesar(r);
  }

  confirmEfectivo() {
    const r = this.confirmTarget();
    if (!r) return;
    this.confirmTarget.set(null);
    this.doProcesar(r);
  }

  private doProcesar(r: ReembolsoAdmin) {
    this.svc.procesar(r.id).subscribe({
      next: (updated) => {
        this.refresh();
        const msg =
          updated.estado === 'completado'
            ? `Reembolso ${r.reserva} completado`
            : `Reembolso ${r.reserva} enviado a procesamiento`;
        this.showToast('ok', msg);
      },
      error: (e) => this.showToast('err', e?.message ?? 'No se pudo procesar'),
    });
  }

  askReject(r: ReembolsoAdmin) {
    this.rejectReason.set('');
    this.rejectTarget.set(r);
  }

  closeReject() {
    this.rejectTarget.set(null);
  }

  submitReject() {
    const r = this.rejectTarget();
    const motivo = this.rejectReason().trim();
    if (!r || !motivo) return;
    this.svc.rechazar(r.id, motivo).subscribe({
      next: () => {
        this.refresh();
        this.rejectTarget.set(null);
        this.showToast('ok', `Reembolso ${r.reserva} rechazado`);
      },
      error: (e) => this.showToast('err', e?.message ?? 'No se pudo rechazar'),
    });
  }

  openDetail(r: ReembolsoAdmin) {
    this.detailTarget.set(r);
  }

  estadoLabel(estado: EstadoReembolsoAdmin): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'procesando':
        return 'Procesando';
      case 'completado':
        return 'Completado';
      case 'rechazado':
        return 'Rechazado';
    }
  }

  money(n: number): string {
    return `L ${n.toLocaleString('es-HN')}`;
  }

  fmtDate(iso: string): string {
    return new Date(iso).toLocaleString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private refresh() {
    this.svc.list().subscribe((res) => this.items.set(res.data));
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
