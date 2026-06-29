import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBadgeCheck,
  LucideBan,
  LucideBanknote,
  LucideCalendar,
  LucideCheckCheck,
  LucideMail,
  LucidePhone,
  LucidePrinter,
  LucideTriangleAlert,
  LucideX,
} from '@lucide/angular';

import { CountdownPagoComponent } from '../../../../shared/components/countdown-pago/countdown-pago.component';
import {
  AdminReservasService,
  ReservaCobrarDetail,
} from '../../../../shared/services/admin-reservas.service';
import {
  CuponesService,
  Cupon,
} from '../../../../shared/services/cupones.service';
import {
  PagosService,
  Pago,
} from '../../../../shared/services/pagos.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../../shared/utils/http-errors';

@Component({
  selector: 'app-recepcionista-pago-efectivo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideArrowLeft,
    LucideArrowRight,
    LucideBadgeCheck,
    LucideBan,
    LucideBanknote,
    LucideCalendar,
    LucideCheckCheck,
    LucideMail,
    LucidePhone,
    LucidePrinter,
    LucideTriangleAlert,
    LucideX,
    CountdownPagoComponent,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main pago-main">
        <div class="shell">
          <header class="topbar">
            <a class="back" routerLink="/admin/recepcionista/buscar-cliente">
              <svg lucideArrowLeft [size]="16"></svg>
              Volver a buscar
            </a>
            <div class="crumb">
              <a routerLink="/admin">Admin</a>
              <span aria-hidden="true">·</span>
              <a routerLink="/admin/recepcionista/buscar-cliente">Taquilla</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Cobrar en efectivo</span>
            </div>
          </header>

          @if (loading()) {
            <section class="skel-grid" aria-busy="true">
              <div class="skel-left">
                <div class="skel-block tall"></div>
              </div>
              <div class="skel-right">
                <div class="skel-block"></div>
              </div>
            </section>
          } @else if (loadError()) {
            <div class="error-banner" role="alert">
              <span>{{ loadError() }}</span>
              <button type="button" class="btn btn-sm" (click)="retryLoad()">Reintentar</button>
            </div>
          } @else if (notFound()) {
            <section class="empty-state">
              <span class="empty-mark"><svg lucideBan [size]="28"></svg></span>
              <h1>No encontramos esa reserva</h1>
              <p>
                El número <strong>#{{ numero() }}</strong> no aparece en el
                sistema. Volvé a buscar al cliente y vuelve a intentarlo.
              </p>
              <a class="btn btn-primary" routerLink="/admin/recepcionista/buscar-cliente">
                Volver a buscar
              </a>
            </section>
          } @else if (exito() && pagoCreado()) {
            @if (pagoCreado(); as pago) {
            <!-- TICKET STUB DE ÉXITO -->
            <section class="success-wrap">
              <div class="success-banner">
                <span class="success-icon"><svg lucideCheckCheck [size]="22"></svg></span>
                <div>
                  <h1>Pago registrado</h1>
                  <p>Entregale al cliente los boletos y el cambio.</p>
                </div>
              </div>

              @if (reserva(); as r) {
                <article class="ticket">
                  <header class="ticket-head">
                    <div class="ticket-brand">
                      <span class="ticket-mark">C</span>
                      <span class="ticket-brand-name">Cinetario</span>
                    </div>
                    <div class="ticket-stub-id">
                      <span class="ticket-stub-label">Pago</span>
                      <span class="ticket-stub-value">#{{ pago.id }}</span>
                    </div>
                  </header>

                  <div class="ticket-body">
                    <div class="ticket-movie">
                      <span class="kicker">Película</span>
                      <h2>{{ r.pelicula.titulo }}</h2>
                      <div class="ticket-meta">
                        <span><svg lucideCalendar [size]="13"></svg> {{ fmtDateTime(r.funcion.fecha_hora) }}</span>
                        <span>{{ r.cine.nombre }} · {{ r.sala.nombre }}</span>
                      </div>
                    </div>

                    <div class="ticket-seats">
                      <span class="kicker">Asientos</span>
                      <div class="ticket-seat-chips">
                        @for (a of r.asientos; track a.id) {
                          <span class="ticket-chip">{{ a.codigo }}</span>
                        }
                      </div>
                    </div>

                    <dl class="ticket-grid">
                      <div>
                        <dt>Reserva</dt>
                        <dd class="mono">#{{ r.numero_reserva }}</dd>
                      </div>
                      <div>
                        <dt>Cliente</dt>
                        <dd>{{ r.cliente.nombre }}</dd>
                      </div>
                      <div>
                        <dt>Método</dt>
                        <dd>Efectivo</dd>
                      </div>
                      <div>
                        <dt>Fecha cobro</dt>
                        <dd>{{ fmtDateTime(pago.created_at) }}</dd>
                      </div>
                    </dl>
                  </div>

                  <div class="ticket-perf" aria-hidden="true"></div>

                  <footer class="ticket-foot">
                    <div class="ticket-foot-row">
                      <span>Subtotal</span>
                      <span class="mono">{{ money(pago.monto_original) }}</span>
                    </div>
                    @if (pago.monto_descuento > 0) {
                      <div class="ticket-foot-row discount">
                        <span>Descuento</span>
                        <span class="mono">−{{ money(pago.monto_descuento) }}</span>
                      </div>
                    }
                    <div class="ticket-foot-row total">
                      <span>Total cobrado</span>
                      <span class="mono">{{ money(pago.monto_final) }}</span>
                    </div>
                    @if (vueltoFinal() > 0) {
                      <div class="ticket-foot-row change">
                        <span>Vuelto entregado</span>
                        <span class="mono">{{ money(vueltoFinal()) }}</span>
                      </div>
                    }
                  </footer>
                </article>
              }

              <div class="success-actions">
                <button class="btn btn-secondary" (click)="imprimir()">
                  <svg lucidePrinter [size]="16"></svg>
                  Vista de impresión
                </button>
                <a class="btn btn-primary" routerLink="/admin/reservas">
                  Siguiente reserva
                  <svg lucideArrowRight [size]="16"></svg>
                </a>
              </div>
            </section>
            }
          } @else if (reserva()) {
            @if (reserva(); as r) {
            <!-- FORMULARIO PRINCIPAL -->
            <section class="cobrar-grid">
              <!-- COLUMNA IZQUIERDA: detalle reserva -->
              <div class="detalle-col">
                <header class="detalle-head">
                  <div>
                    <span class="kicker">Reserva</span>
                    <h1>#{{ r.numero_reserva }}</h1>
                  </div>
                  <span
                    class="estado-badge"
                    [class.pendiente]="r.estado === 'pendiente_pago'"
                    [class.pagada]="r.estado === 'pagada'"
                    [class.cancelada]="r.estado === 'cancelada'"
                    [class.expirada]="r.estado === 'expirada'"
                  >
                    {{ estadoLabel(r.estado) }}
                  </span>
                </header>

                @if (r.estado !== 'pendiente_pago') {
                  <div class="alert" role="alert">
                    <svg lucideTriangleAlert [size]="16"></svg>
                    <div>
                      <strong>Esta reserva no es cobrable.</strong>
                      <span>{{ noCobrableMsg(r.estado) }}</span>
                    </div>
                  </div>
                } @else if (r.expira_en) {
                  <app-countdown-pago [expiraEn]="r.expira_en" (expirado)="onExpiradoCountdown()" />
                }
                @if (reservaExpirada()) {
                  <div class="error-banner" role="alert">
                    La reserva expiró durante el cobro. Los asientos se liberaron.
                    <a routerLink="/admin/reservas" class="btn">Volver al listado</a>
                  </div>
                }

                <article class="card cliente-card">
                  <span class="card-kicker">Cliente</span>
                  <div class="cliente-row">
                    <span class="cliente-avatar">{{ iniciales(r.cliente.nombre) }}</span>
                    <div class="cliente-info">
                      <strong class="cliente-nombre">{{ r.cliente.nombre }}</strong>
                      <span class="cliente-contact">
                        <svg lucideMail [size]="12"></svg>{{ r.cliente.email }}
                      </span>
                      @if (r.cliente.telefono) {
                        <span class="cliente-contact">
                          <svg lucidePhone [size]="12"></svg>{{ r.cliente.telefono }}
                        </span>
                      }
                    </div>
                  </div>
                </article>

                <article class="card funcion-card">
                  <span class="card-kicker">Función</span>
                  <h3 class="funcion-titulo">{{ r.pelicula.titulo }}</h3>
                  <div class="funcion-meta">
                    <span><svg lucideCalendar [size]="13"></svg> {{ fmtDateTime(r.funcion.fecha_hora) }}</span>
                    <span>{{ r.cine.nombre }}</span>
                    <span>{{ r.sala.nombre }}</span>
                  </div>
                </article>

                <article class="card asientos-card">
                  <header class="asientos-head">
                    <span class="card-kicker">Asientos · {{ r.num_asientos }}</span>
                    <span class="asientos-subtotal">
                      Subtotal <strong class="mono">{{ money(subtotal()) }}</strong>
                    </span>
                  </header>
                  <ul class="asientos-list">
                    @for (a of r.asientos; track a.id) {
                      <li class="asiento-row" [attr.data-tipo]="a.tipo">
                        <span class="asiento-codigo">{{ a.codigo }}</span>
                        <span class="asiento-tipo">{{ a.tipo }}</span>
                        <span class="asiento-precio mono">{{ money(a.precio) }}</span>
                      </li>
                    }
                  </ul>
                </article>
              </div>

              <!-- COLUMNA DERECHA: caja -->
              <aside class="caja-col">
                <div class="caja">
                  <div class="caja-total">
                    <span class="caja-kicker">Total a cobrar</span>
                    <div class="caja-total-num">
                      <span class="caja-moneda">L</span>
                      <span class="caja-amount mono">{{ totalFinal() | number:'1.2-2' }}</span>
                    </div>
                    @if (descuento() > 0) {
                      <span class="caja-tachado mono">
                        Antes <span class="strike">{{ money(subtotal()) }}</span>
                      </span>
                    }
                  </div>

                  <hr class="caja-rule" />

                  <div class="caja-section">
                    <label class="caja-label" for="cupon">Cupón (opcional)</label>
                    @if (cupon(); as c) {
                      <div class="cupon-pill">
                        <svg lucideBadgeCheck [size]="14"></svg>
                        <span class="cupon-codigo">{{ c.codigo }}</span>
                        <span class="cupon-meta">−{{ money(descuento()) }}</span>
                        <button
                          type="button"
                          class="cupon-remove"
                          (click)="removerCupon()"
                          aria-label="Quitar cupón"
                        >
                          <svg lucideX [size]="13"></svg>
                        </button>
                      </div>
                    } @else {
                      <div class="cupon-input-row">
                        <input
                          id="cupon"
                          type="text"
                          class="input"
                          placeholder="Ej. PROMO10"
                          autocomplete="off"
                          [(ngModel)]="cuponInput"
                          (keyup.enter)="aplicarCupon()"
                          [disabled]="cuponLoading() || noCobrable()"
                        />
                        <button
                          type="button"
                          class="btn btn-secondary"
                          (click)="aplicarCupon()"
                          [disabled]="!cuponInput.trim() || cuponLoading() || noCobrable()"
                        >
                          {{ cuponLoading() ? 'Validando…' : 'Aplicar' }}
                        </button>
                      </div>
                      @if (cuponError(); as msg) {
                        <p class="cupon-error">
                          <svg lucideX [size]="12"></svg> {{ msg }}
                        </p>
                      }
                    }
                  </div>

                  <div class="caja-section">
                    <label class="caja-label" for="paga">Cliente entrega (L)</label>
                    <div class="paga-input-wrap">
                      <span class="paga-moneda">L</span>
                      <input
                        id="paga"
                        type="number"
                        class="input paga-input mono"
                        inputmode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        [ngModel]="clientePagaInput()"
                        (ngModelChange)="clientePagaInput.set($event)"
                        (keyup.enter)="confirmar()"
                        [disabled]="noCobrable() || procesando()"
                      />
                    </div>
                    <div class="vuelto-pill"
                      [class.ok]="vuelto() >= 0 && clientePaga() > 0"
                      [class.miss]="vuelto() < 0"
                    >
                      @if (clientePaga() === 0) {
                        <span class="vuelto-label">Ingresá el monto recibido</span>
                      } @else if (vuelto() >= 0) {
                        <span class="vuelto-label">Vuelto</span>
                        <span class="vuelto-amount mono">{{ money(vuelto()) }}</span>
                      } @else {
                        <span class="vuelto-label">Faltan</span>
                        <span class="vuelto-amount mono">{{ money(-vuelto()) }}</span>
                      }
                    </div>

                    <!-- Quick-fill buttons -->
                    @if (!noCobrable()) {
                      <div class="quick-fills">
                        <button type="button" class="quick" (click)="quickFill(totalFinal())">
                          Exacto
                        </button>
                        @for (q of quickAmounts(); track q) {
                          <button type="button" class="quick" (click)="quickFill(q)">
                            L {{ q }}
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <button
                    type="button"
                    class="btn btn-primary btn-confirm"
                    (click)="confirmar()"
                    [disabled]="!canConfirm() || procesando() || reservaExpirada()"
                  >
                    <svg lucideBanknote [size]="18"></svg>
                    {{ procesando() ? 'Procesando…' : 'Confirmar pago en efectivo' }}
                  </button>

                  <p class="caja-fineprint">
                    Al confirmar, el sistema registrará el pago en efectivo y marcará la reserva como pagada.
                  </p>
                </div>
              </aside>
            </section>
            }
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './pago-efectivo.component.scss',
})
export class RecepcionistaPagoEfectivoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminReservasSvc = inject(AdminReservasService);
  private cuponesSvc = inject(CuponesService);
  private pagosSvc = inject(PagosService);
  private toast = inject(ToastService);

  readonly numero = signal<string>('');
  readonly reserva = signal<ReservaCobrarDetail | null>(null);
  readonly loading = signal<boolean>(true);
  readonly notFound = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);

  readonly cupon = signal<Cupon | null>(null);
  readonly cuponLoading = signal<boolean>(false);
  readonly cuponError = signal<string | null>(null);
  cuponInput = '';

  readonly clientePagaInput = signal<number | null>(null);

  readonly procesando = signal<boolean>(false);
  readonly exito = signal<boolean>(false);
  readonly pagoCreado = signal<Pago | null>(null);
  readonly vueltoFinal = signal<number>(0);
  readonly reservaExpirada = signal(false);

  // ── Computeds ───────────────────────────────────────────────────────────
  readonly subtotal = computed(
    () =>
      this.reserva()?.asientos.reduce((s, a) => s + a.precio, 0) ?? 0,
  );

  readonly descuento = computed(() => {
    const c = this.cupon();
    if (!c) return 0;
    const base = this.subtotal();
    const valor = Number(c.valor);
    if (c.tipo === 'porcentaje') {
      return Math.min(base, +(base * (valor / 100)).toFixed(2));
    }
    return Math.min(base, valor);
  });

  readonly totalFinal = computed(() =>
    Math.max(0, +(this.subtotal() - this.descuento()).toFixed(2)),
  );

  readonly clientePaga = computed(() => Number(this.clientePagaInput() ?? 0));

  readonly vuelto = computed(() =>
    +(this.clientePaga() - this.totalFinal()).toFixed(2),
  );

  readonly noCobrable = computed(
    () => this.reserva()?.estado !== 'pendiente_pago',
  );

  readonly canConfirm = computed(
    () =>
      !this.noCobrable() &&
      this.clientePaga() >= this.totalFinal() &&
      this.totalFinal() > 0,
  );

  readonly quickAmounts = computed(() => {
    const t = this.totalFinal();
    if (!t) return [];
    const candidates = [50, 100, 200, 500, 1000];
    return candidates.filter((c) => c > t).slice(0, 3);
  });

  constructor() {
    effect(() => {
      const numero =
        this.route.snapshot.paramMap.get('numero') ?? '';
      this.numero.set(numero);
      this.doLoad(numero);
    });
  }

  private doLoad(numero: string) {
    this.loading.set(true);
    this.notFound.set(false);
    this.loadError.set(null);

    this.adminReservasSvc.getByNumero(numero).subscribe({
      next: (r) => {
        if (!r) {
          this.notFound.set(true);
        } else {
          this.reserva.set(r);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  retryLoad() {
    this.doLoad(this.numero());
  }

  onExpiradoCountdown() {
    this.reservaExpirada.set(true);
  }

  // ── Acciones ────────────────────────────────────────────────────────────
  aplicarCupon(): void {
    const codigo = this.cuponInput.trim().toUpperCase();
    if (!codigo) return;

    this.cuponLoading.set(true);
    this.cuponError.set(null);

    this.cuponesSvc.validar(codigo).subscribe({
      next: (res) => {
        if (res.valido && res.cupon) {
          this.cupon.set(res.cupon);
          this.cuponInput = '';
        } else {
          this.cuponError.set(res.mensaje ?? 'Cupón no válido');
        }
        this.cuponLoading.set(false);
      },
      error: () => {
        this.cuponError.set('No se pudo validar el cupón');
        this.cuponLoading.set(false);
      },
    });
  }

  removerCupon(): void {
    this.cupon.set(null);
    this.cuponError.set(null);
  }

  quickFill(amount: number): void {
    this.clientePagaInput.set(amount);
  }

  confirmar(): void {
    if (this.reservaExpirada()) return;
    if (!this.canConfirm() || this.procesando()) return;
    const r = this.reserva();
    if (!r) return;

    this.procesando.set(true);
    this.pagosSvc
      .crearEfectivo({
        id_reserva: r.id,
        codigo_cupon: this.cupon()?.codigo,
      })
      .subscribe({
        next: (pago) => {
          const pagoReal: Pago = {
            ...pago,
            id_cupon: this.cupon()?.id,
          };
          this.vueltoFinal.set(this.vuelto());
          this.pagoCreado.set(pagoReal);
          this.exito.set(true);
          this.procesando.set(false);
        },
        error: (err) => {
          const code = err?.error?.code ?? err?.error?.response?.code;
          if (err?.status === 409 && code === 'RESERVA_EXPIRADA') {
            this.reservaExpirada.set(true);
            this.toast.show('La reserva expiró durante el cobro.');
            this.procesando.set(false);
            return;
          }
          this.toast.show(extractMessage(err));
          this.procesando.set(false);
        },
      });
  }

  imprimir(): void {
    if (typeof window !== 'undefined') window.print();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  estadoLabel(e: string): string {
    switch (e) {
      case 'pendiente_pago':
        return 'Pendiente de pago';
      case 'pagada':
        return 'Pagada';
      case 'cancelada':
        return 'Cancelada';
      case 'reembolsada':
        return 'Reembolsada';
      case 'expirada':
        return 'Expirada';
      default:
        return e;
    }
  }

  noCobrableMsg(e: string): string {
    switch (e) {
      case 'pagada':
        return 'Esta reserva ya fue pagada anteriormente.';
      case 'cancelada':
        return 'Esta reserva fue cancelada y no se puede cobrar.';
      case 'expirada':
        return 'La reserva expiró antes de completarse el pago.';
      case 'reembolsada':
        return 'Esta reserva fue reembolsada.';
      default:
        return 'No se puede cobrar esta reserva.';
    }
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter((p) => p.length)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  money(n: number): string {
    return `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  fmtDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-HN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  fmtRelativo(iso: string): string {
    const diff = (new Date(iso).getTime() - Date.now()) / 60000;
    if (diff < 1) return 'en menos de 1 min';
    if (diff < 60) return `en ${Math.round(diff)} min`;
    return `el ${this.fmtDateTime(iso)}`;
  }
}
