import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideAlertCircle,
  LucideFilm,
  LucideClock,
  LucideQrCode,
  LucideCreditCard,
  LucideRefreshCcw,
  LucideX,
  LucideMail,
  LucideDownload,
} from '@lucide/angular';

import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../shared/services/auth.service';
import { Reserva, EstadoReserva, ReservasService } from '../../../shared/services/reservas.service';
import { Funcion, FuncionesService } from '../../../shared/services/funciones.service';
import { Pelicula, PeliculasService } from '../../../shared/services/peliculas.service';
import { Cine, CinesService } from '../../../shared/services/cines.service';
import { Pago, PagosService } from '../../../shared/services/pagos.service';
import {
  PoliticasCancelacionService,
  PoliticaCancelacion,
  ReglaPolitica,
} from '../../../shared/services/politicas-cancelacion.service';

@Component({
  selector: 'app-reserva-detalle-cliente',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    AppbarComponent,
    FooterComponent,
    LucideArrowLeft,
    LucideAlertCircle,
    LucideFilm,
    LucideClock,
    LucideQrCode,
    LucideCreditCard,
    LucideRefreshCcw,
    LucideX,
    LucideMail,
    LucideDownload,
  ],
  templateUrl: './reserva-detalle-cliente.component.html',
  styleUrl: './reserva-detalle-cliente.component.scss',
})
export class ReservaDetalleClienteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly reservasSvc = inject(ReservasService);
  private readonly funcionesSvc = inject(FuncionesService);
  private readonly peliculasSvc = inject(PeliculasService);
  private readonly cinesSvc = inject(CinesService);
  private readonly pagosSvc = inject(PagosService);
  private readonly politicasSvc = inject(PoliticasCancelacionService);

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  // ── Estado ────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly reserva = signal<Reserva | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);
  readonly cine = signal<Cine | null>(null);
  readonly funcion = signal<Funcion | null>(null);
  readonly pago = signal<Pago | null>(null);
  readonly politicas = signal<PoliticaCancelacion[]>([]);
  readonly reglas = signal<ReglaPolitica[]>([]);
  readonly toast = signal<{ kind: 'ok' | 'err'; text: string } | null>(null);
  readonly enviando = signal(false);

  // ── Computed ──────────────────────────────────────────────────
  readonly esFutura = computed(() => {
    const f = this.funcion();
    if (!f) return false;
    return new Date(f.fecha_inicio).getTime() > Date.now();
  });

  readonly puedeCancel = computed(
    () => this.reserva()?.estado === 'pagada' && this.esFutura(),
  );

  readonly horasRestantes = computed(() => {
    const f = this.funcion();
    if (!f) return 0;
    const ms = new Date(f.fecha_inicio).getTime() - Date.now();
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

  readonly porcentajeReembolso = computed(
    () => this.reglaAplicable()?.porcentaje_reembolso ?? 0,
  );

  readonly montoReembolso = computed(() => {
    const monto = this.pago()?.monto_final ?? 0;
    return Math.round(((monto * this.porcentajeReembolso()) / 100) * 100) / 100;
  });

  readonly tiempoBadgeTexto = computed(() => {
    const h = this.horasRestantes();
    if (h < 0) {
      const absH = Math.abs(h);
      const dias = Math.floor(absH / 24);
      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Ayer';
      return `Hace ${dias} días`;
    }
    if (h < 1) return 'Ahora';
    if (h < 24) {
      const horas = Math.floor(h);
      const min = Math.round((h - horas) * 60);
      return `En ${horas}h ${min}min`;
    }
    const dias = Math.floor(h / 24);
    if (dias === 1) return 'En 1 día';
    return `En ${dias} días`;
  });

  readonly tiempoBadgeKind = computed((): 'urgente' | 'normal' | 'pasado' => {
    const h = this.horasRestantes();
    if (h < 0) return 'pasado';
    if (h < 24) return 'urgente';
    return 'normal';
  });

  readonly salaNombre = computed(() => {
    const cine = this.cine();
    const funcion = this.funcion();
    if (!cine || !funcion) return '—';
    return cine.salas.find((s) => s.id === funcion.id_sala)?.nombre ?? '—';
  });

  readonly politicaActiva = computed(
    () => this.politicas().find((p) => p.activa) ?? null,
  );

  // ── Constructor / carga ───────────────────────────────────────
  constructor() {
    const numero = this.route.snapshot.paramMap.get('numero');
    if (!numero) {
      this.error.set('Número de reserva no encontrado en la ruta.');
      this.cargando.set(false);
      return;
    }

    this.reservasSvc.list().subscribe({
      next: (all) => {
        const userId = this.auth.user()?.id;
        let mine = userId ? all.filter((r) => r.id_usuario === userId) : all;
        // MOCK FALLBACK: si el usuario logueado no tiene reservas en los mocks
        // (los mocks usan u-1…u-12 y el usuario real puede tener otro id)
        if (mine.length === 0) mine = all;

        const reserva = mine.find((r) => r.numero_reserva === numero) ?? null;
        if (!reserva) {
          this.error.set('Esta reserva no existe o no es tuya.');
          this.cargando.set(false);
          return;
        }
        this.reserva.set(reserva);

        // Carga en cadena: funcion → pelicula + cine + pago + politicas
        this.funcionesSvc.getById(reserva.id_funcion).subscribe({
          next: (funcion) => {
            this.funcion.set(funcion);

            // pago
            this.pagosSvc.getByReserva(reserva.id).subscribe({
              next: (p) => this.pago.set(p ?? null),
              error: () => this.pago.set(null),
            });

            // pelicula
            this.peliculasSvc.getById(funcion.id_pelicula).subscribe({
              next: (pel) => this.pelicula.set(pel),
              error: () => this.error.set('No se pudo cargar la película.'),
            });

            // cine → politicas → reglas
            this.cinesSvc.getById(funcion.id_cine).subscribe({
              next: (cine) => {
                this.cine.set(cine);
                this.cargando.set(false);

                this.politicasSvc.listByCine(funcion.id_cine).subscribe({
                  next: (politicas) => {
                    this.politicas.set(politicas);
                    const activa = politicas.find((p) => p.activa);
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
      error: () => {
        this.error.set('No se pudo cargar la reserva.');
        this.cargando.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  fechaFuncionTexto(): string {
    const f = this.funcion();
    if (!f) return '—';
    const d = new Date(f.fecha_inicio);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}, ${hh}:${mm}`;
  }

  estadoLabel(estado: EstadoReserva | string): string {
    const map: Record<string, string> = {
      pagada: 'Pagada',
      cancelada: 'Cancelada',
      reembolsada: 'Reembolsada',
      pendiente_pago: 'Pendiente de pago',
      expirada: 'Expirada',
    };
    return map[estado] ?? estado;
  }

  metodoLabel(): string {
    const metodo = this.pago()?.metodo;
    if (metodo === 'tarjeta') return 'Tarjeta de crédito/débito';
    if (metodo === 'efectivo') return 'Efectivo en taquilla';
    return metodo ?? '—';
  }

  // ── QR placeholder determinístico (rejilla 12×12, celdas 11px → 132px total) ──
  qrCells(seed: string): Array<{ x: number; y: number }> {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const cells: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        h = (h * 1103515245 + 12345) >>> 0;
        // densidad mayor en esquinas (tipo QR finder pattern)
        const isCorner = (x < 3 && y < 3) || (x > 8 && y < 3) || (x < 3 && y > 8);
        if (isCorner || (h & 1)) {
          cells.push({ x: x * 11, y: y * 11 });
        }
      }
    }
    return cells;
  }

  // ── Acciones mock ─────────────────────────────────────────────
  cancelar(): void {
    const r = this.reserva();
    if (!r) return;
    this.showToast('ok', 'Te llevamos a cancelar…');
    // TEMP: flujo cliente de cancelación pendiente (Andrea #136 + #139)
    setTimeout(() => this.router.navigate(['/admin/reservas', r.id, 'cancelar']), 800);
  }

  reenviarPorCorreo(): void {
    if (this.enviando()) return;
    const email = this.auth.user()?.email ?? 'tu correo';
    this.enviando.set(true);
    this.showToast('ok', `Te reenviamos el boleto a ${email}`);
    setTimeout(() => this.enviando.set(false), 60_000);
  }

  descargarPdf(): void {
    this.showToast('ok', 'Tu boleto se está descargando…');
  }

  showToast(kind: 'ok' | 'err', text: string): void {
    this.toast.set({ kind, text });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
