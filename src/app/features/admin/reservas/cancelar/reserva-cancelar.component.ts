import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAlertTriangle,
  LucideArrowLeft,
  LucideTrash2,
  LucideClock,
  LucideTicket,
  LucideUser,
  LucideMail,
  LucideFilm,
} from '@lucide/angular';

import { AdminReservasService, AdminReservaDetail, UsuarioReserva } from '../../../../shared/services/admin-reservas.service';
import { FuncionesService, Funcion } from '../../../../shared/services/funciones.service';
import { PeliculasService, Pelicula } from '../../../../shared/services/peliculas.service';
import { CinesService, Cine } from '../../../../shared/services/cines.service';
import { PagosService, Pago } from '../../../../shared/services/pagos.service';
import {
  PoliticasCancelacionService,
  PoliticaCancelacion,
  ReglaPolitica,
} from '../../../../shared/services/politicas-cancelacion.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../../shared/utils/http-errors';

@Component({
  selector: 'app-admin-reserva-cancelar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideAlertTriangle,
    LucideArrowLeft,
    LucideTrash2,
    LucideClock,
    LucideTicket,
    LucideUser,
    LucideFilm,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell shell-narrow">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/reservas">Reservas</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Cancelar {{ reserva()?.numero_reserva ?? '…' }}</span>
          </div>

          @if (cargando()) {
            <div class="loading">Cargando reserva…</div>
          } @else if (error()) {
            <div class="err-card">
              <svg lucideAlertTriangle [size]="20"></svg>
              <p>{{ error() }}</p>
              <a routerLink="/admin/reservas" class="btn btn-ghost">
                <svg lucideArrowLeft [size]="14"></svg> Volver
              </a>
            </div>
          } @else if (reserva() && pago() && funcion() && pelicula() && cine()) {
            <article class="confirm-card">
              <header class="confirm-head danger">
                <span class="ic">
                  <svg lucideAlertTriangle [size]="20"></svg>
                </span>
                <div>
                  <h1>Cancelar reserva {{ reserva()!.numero_reserva }}</h1>
                  <p class="lead">Esta acción no se puede deshacer</p>
                </div>
              </header>

              <section class="data-grid">
                <div class="data-block">
                  <h3><svg lucideUser [size]="12"></svg> Cliente</h3>
                  <p class="b">{{ cliente()?.nombre ?? '—' }}</p>
                  <p class="sub">{{ cliente()?.email ?? '—' }}</p>
                </div>
                <div class="data-block">
                  <h3><svg lucideFilm [size]="12"></svg> Función</h3>
                  <p class="b">{{ pelicula()!.titulo }}</p>
                  <p class="sub">{{ cine()!.nombre }} · Sala {{ salaNombre() }}</p>
                  <p class="sub">{{ fechaFuncionTexto() }}</p>
                </div>
                <div class="data-block">
                  <h3><svg lucideTicket [size]="12"></svg> Asientos</h3>
                  <p class="b">{{ reserva()!.num_asientos }} asiento(s)</p>
                  <p class="sub">{{ asientosCodigos() || '—' }}</p>
                </div>
                <div class="data-block">
                  <h3><svg lucideClock [size]="12"></svg> Tiempo restante</h3>
                  <p
                    class="time-badge"
                    [class.urgent]="tiempoBadgeKind() === 'urgente'"
                    [class.past]="tiempoBadgeKind() === 'pasado'"
                  >
                    <svg lucideClock [size]="14"></svg>
                    {{ tiempoBadgeTexto() }}
                  </p>
                </div>
              </section>

              <section class="refund-block">
                <h3>Política de cancelación aplicada</h3>
                @if (politica(); as p) {
                  <p class="b">{{ p.nombre }}</p>
                  @if (reglaAplicable(); as r) {
                    <p class="sub">
                      Regla: entre {{ r.horas_antes_minimo }}h y
                      {{ r.horas_antes_maximo !== null ? r.horas_antes_maximo + 'h' : '∞' }}
                      → {{ r.porcentaje_reembolso }}%
                    </p>
                  } @else {
                    <p class="sub warn">Sin regla aplicable para el tiempo restante (0% reembolso)</p>
                  }

                  <dl class="refund-summary">
                    <div>
                      <dt>Monto pagado</dt>
                      <dd class="tnum">L {{ pago()!.monto_final | number:'1.2-2' }}</dd>
                    </div>
                    <div>
                      <dt>% Reembolso</dt>
                      <dd class="tnum">{{ porcentajeReembolso() }}%</dd>
                    </div>
                    <div class="hl">
                      <dt>Monto a reembolsar</dt>
                      <dd class="tnum">L {{ montoReembolso() | number:'1.2-2' }}</dd>
                    </div>
                  </dl>
                } @else {
                  <p class="sub warn">Este cine no tiene política de cancelación configurada</p>
                }
              </section>

              <section class="motivo-block">
                <label for="motivo">Motivo interno (opcional)</label>
                <textarea
                  id="motivo"
                  rows="3"
                  placeholder="Notas para el equipo… (solo visible para staff)"
                  [ngModel]="motivo()"
                  (ngModelChange)="motivo.set($event)"
                ></textarea>
              </section>

              <footer class="actions">
                <a routerLink="/admin/reservas" class="btn btn-ghost">
                  <svg lucideArrowLeft [size]="14"></svg>
                  Volver
                </a>
                <button class="btn btn-danger" (click)="confirmar()" [disabled]="cancelando()">
                  <svg lucideTrash2 [size]="14"></svg>
                  {{ cancelando() ? 'Cancelando…' : 'Cancelar reserva' }}
                </button>
              </footer>
            </article>
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
  styleUrl: './reserva-cancelar.component.scss',
})
export class AdminReservaCancelarComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservasSvc = inject(AdminReservasService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private pagosSvc = inject(PagosService);
  private politicasSvc = inject(PoliticasCancelacionService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly reserva = signal<AdminReservaDetail | null>(null);
  readonly cliente = signal<UsuarioReserva | null>(null);
  readonly pago = signal<Pago | null>(null);
  readonly funcion = signal<Funcion | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);
  readonly cine = signal<Cine | null>(null);
  readonly politica = signal<PoliticaCancelacion | null>(null);
  readonly reglas = signal<ReglaPolitica[]>([]);
  readonly motivo = signal<string>('');
  readonly cancelando = signal(false);
  readonly toast = signal<{ kind: 'ok' | 'err'; text: string } | null>(null);

  readonly horasRestantes = computed(() => {
    const f = this.funcion();
    if (!f) return 0;
    const ms = new Date(f.fecha_hora).getTime() - Date.now();
    return Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
  });

  readonly reglaAplicable = computed((): ReglaPolitica | null => {
    const horas = this.horasRestantes();
    return (
      this.reglas().find((r) => {
        const minOk = horas >= r.horas_antes_minimo;
        const maxOk = r.horas_antes_maximo === null || horas < r.horas_antes_maximo;
        return minOk && maxOk;
      }) ?? null
    );
  });

  readonly porcentajeReembolso = computed(() => this.reglaAplicable()?.porcentaje_reembolso ?? 0);

  readonly montoReembolso = computed(() => {
    const monto = this.pago()?.monto_final ?? 0;
    return Math.round(((monto * this.porcentajeReembolso()) / 100) * 100) / 100;
  });

  readonly tiempoBadgeTexto = computed(() => {
    const h = this.horasRestantes();
    if (h < 0) return 'Ya pasó';
    if (h < 24) {
      const horas = Math.floor(h);
      const min = Math.round((h - horas) * 60);
      return `En ${horas}h ${min}min`;
    }
    const dias = Math.floor(h / 24);
    const horas = Math.floor(h % 24);
    return `En ${dias}d ${horas}h`;
  });

  readonly tiempoBadgeKind = computed((): 'urgente' | 'normal' | 'pasado' => {
    const h = this.horasRestantes();
    if (h < 0) return 'pasado';
    if (h < 24) return 'urgente';
    return 'normal';
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID de reserva no encontrado en la ruta.');
      this.cargando.set(false);
      return;
    }

    this.reservasSvc.getById(id).subscribe({
      next: (reserva) => {
        if (!reserva) {
          this.error.set('No se encontró la reserva.');
          this.cargando.set(false);
          return;
        }
        this.reserva.set(reserva);

        // Set cliente directly from embedded usuario (no extra HTTP call)
        this.cliente.set(reserva.usuario ?? null);

        // Load pago — getByReserva returns array, take the first exitoso/reembolsado
        this.pagosSvc.getByReserva(reserva.id).subscribe({
          next: (ps) => this.pago.set(
            ps.find((p) => p.estado === 'exitoso' || p.estado === 'reembolsado') ?? ps[0] ?? null
          ),
          error: () => this.pago.set(null),
        });

        // Load funcion → then pelicula + cine
        if (!reserva.id_funcion) {
          this.error.set('Función no encontrada para esta reserva.');
          this.cargando.set(false);
          return;
        }
        this.funcionesSvc.getById(reserva.id_funcion).subscribe({
          next: (funcion) => {
            this.funcion.set(funcion);

            this.peliculasSvc.getById(funcion.id_pelicula).subscribe({
              next: (pel) => this.pelicula.set(pel),
              error: () => this.error.set('No se pudo cargar la película.'),
            });

            this.cinesSvc.getById(funcion.id_cine).subscribe({
              next: (cine) => {
                this.cine.set(cine);
                this.cargando.set(false);

                // Load politicas
                this.politicasSvc.listByCine(funcion.id_cine).subscribe({
                  next: (politicas) => {
                    const activa = politicas.find((p) => p.activa) ?? null;
                    this.politica.set(activa);
                    if (activa) {
                      this.politicasSvc.listReglas(activa.id).subscribe({
                        next: (r) => this.reglas.set(r),
                        error: () => {},
                      });
                    }
                  },
                  error: () => {},
                });
              },
              error: () => {
                this.error.set('No se pudo cargar el cine.');
                this.cargando.set(false);
              },
            });
          },
          error: () => {
            this.error.set('No se pudo cargar la función.');
            this.cargando.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(extractMessage(err));
        this.cargando.set(false);
      },
    });
  }

  asientosCodigos(): string {
    return (this.reserva()?.asientos ?? []).map((a) => a.codigo).join(', ');
  }

  salaNombre(): string {
    const cine = this.cine();
    const funcion = this.funcion();
    if (!cine || !funcion) return '—';
    return cine.salas.find((s) => s.id === funcion.id_sala)?.nombre ?? '—';
  }

  fechaFuncionTexto(): string {
    const funcion = this.funcion();
    if (!funcion) return '';
    const d = new Date(funcion.fecha_hora);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}, ${hh}:${mm}`;
  }

  confirmar() {
    const reserva = this.reserva();
    if (!reserva || this.cancelando()) return;

    this.cancelando.set(true);
    this.reservasSvc.cancelar(reserva.id).subscribe({
      next: (res) => {
        this.cancelando.set(false);
        const monto = res.reembolso?.monto ?? this.montoReembolso();
        this.showToast(
          'ok',
          `Reserva ${reserva.numero_reserva} cancelada · Reembolso L ${monto.toFixed(2)}`,
        );
        setTimeout(() => this.router.navigate(['/admin/reservas']), 1800);
      },
      error: (err) => {
        this.cancelando.set(false);
        this.showToast('err', extractMessage(err));
      },
    });
  }

  private showToast(kind: 'ok' | 'err', text: string) {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
