import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideMail,
  LucideCheckCircle2,
  LucideBan,
  LucideArmchair,
  LucideUser,
  LucideCreditCard,
  LucideTicket,
  LucideCircleAlert,
  LucideReceipt,
  LucideFilm,
  LucideTimer,
} from '@lucide/angular';

import {
  AdminReservasService,
  AdminReservaDetail,
  UsuarioReserva,
} from '../../../../shared/services/admin-reservas.service';
import {
  Pago,
  PagosService,
} from '../../../../shared/services/pagos.service';
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
import { extractMessage } from '../../../../shared/utils/http-errors';

type TimelineKind = 'created' | 'blocked' | 'paid' | 'cancelled' | 'refunded' | 'expired';

interface TimelineEvent {
  kind: TimelineKind;
  title: string;
  detail: string;
  at: string;
}

@Component({
  selector: 'app-admin-reserva-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    LucideArrowLeft,
    LucideMail,
    LucideCheckCircle2,
    LucideBan,
    LucideArmchair,
    LucideUser,
    LucideCreditCard,
    LucideTicket,
    LucideCircleAlert,
    LucideReceipt,
    LucideFilm,
    LucideTimer,
  ],
  templateUrl: './reserva-detalle.component.html',
  styleUrls: ['../operaciones.shared.scss', './reserva-detalle.component.scss'],
})
export class AdminReservaDetalleComponent {
  private reservasSvc = inject(AdminReservasService);
  private pagosSvc = inject(PagosService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly detalleError = signal<string | null>(null);
  readonly reserva = signal<AdminReservaDetail | null>(null);
  readonly notFound = signal(false);
  readonly cliente = signal<UsuarioReserva | null>(null);
  readonly pago = signal<Pago | null>(null);
  readonly funcion = signal<Funcion | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);
  readonly cine = signal<Cine | null>(null);

  readonly toastMsg = signal<string | null>(null);

  readonly timeline = computed<TimelineEvent[]>(() => {
    const r = this.reserva();
    if (!r) return [];
    const events: TimelineEvent[] = [];
    const cliente = this.cliente()?.nombre ?? 'cliente';
    events.push({
      kind: 'created',
      title: 'Reserva creada',
      detail: `${cliente} inició la compra desde el sitio web`,
      at: r.created_at,
    });
    events.push({
      kind: 'blocked',
      title: 'Asientos bloqueados',
      detail: r.asientos?.length
        ? `${r.asientos.map((a) => a.codigo).join(', ')} reservados por 15 minutos`
        : 'Asientos retenidos por 15 minutos',
      at: r.created_at,
    });
    const pago = this.pago();
    if (r.estado === 'pagada' || r.estado === 'cancelada' || r.estado === 'reembolsada') {
      const metodoLabel = pago
        ? pago.metodo === 'tarjeta' && pago.ultimos4_snapshot
          ? `${this.brandLabel(pago.marca_snapshot)} ${pago.ultimos4_snapshot}`
          : 'Efectivo en taquilla'
        : 'Pago confirmado';
      events.push({
        kind: 'paid',
        title: 'Pago confirmado',
        detail: metodoLabel,
        at: pago?.created_at ?? r.updated_at,
      });
    }
    if (r.estado === 'cancelada') {
      events.push({
        kind: 'cancelled',
        title: 'Reserva cancelada',
        detail: r.notas_internas ?? 'Cancelada por admin',
        at: r.updated_at,
      });
    }
    if (r.estado === 'reembolsada') {
      events.push({
        kind: 'refunded',
        title: 'Reembolso procesado',
        detail: r.notas_internas ?? 'Reembolsado al método de pago original',
        at: r.updated_at,
      });
    }
    if (r.estado === 'expirada') {
      events.push({
        kind: 'expired',
        title: 'Reserva expirada',
        detail: 'El cliente no completó el pago dentro del plazo de 15 minutos',
        at: r.expira_en ?? r.updated_at,
      });
    }
    return events;
  });

  readonly futurosHitos = computed<{ kind: TimelineKind; title: string }[]>(() => {
    const r = this.reserva();
    if (!r) return [];
    const present = new Set(this.timeline().map((e) => e.kind));
    const all: { kind: TimelineKind; title: string }[] = [
      { kind: 'paid', title: 'Pago confirmado' },
      { kind: 'cancelled', title: 'Cancelación' },
      { kind: 'refunded', title: 'Reembolso' },
    ];
    if (r.estado === 'cancelada' || r.estado === 'reembolsada' || r.estado === 'expirada') {
      return [];
    }
    return all.filter((x) => !present.has(x.kind));
  });

  private currentId: string | null = null;

  constructor() {
    this.route.paramMap.subscribe((p) => {
      this.currentId = p.get('id');
      this.load(this.currentId);
    });
  }

  reload() {
    this.load(this.currentId);
  }

  private load(id: string | null) {
    if (!id) {
      this.notFound.set(true);
      return;
    }
    this.loading.set(true);
    this.detalleError.set(null);
    this.notFound.set(false);
    this.reserva.set(null);

    this.reservasSvc.getById(id).subscribe({
      next: (r) => {
        this.loading.set(false);
        if (!r) {
          this.notFound.set(true);
          return;
        }
        this.reserva.set(r);
        // Set cliente directly from embedded usuario (no extra HTTP call)
        this.cliente.set(r.usuario ?? null);
        // Load full Pago (with payment method details not in the detail response)
        this.pagosSvc.getByReserva(r.id).subscribe((ps) =>
          this.pago.set(ps.find((p) => p.estado === 'exitoso' || p.estado === 'reembolsado') ?? ps[0] ?? null)
        );
        // Load Funcion by id (for salaNombre() which needs id_sala/id_cine/id_pelicula)
        if (r.id_funcion) {
          this.funcionesSvc.getById(r.id_funcion).subscribe({
            next: (f) => {
              this.funcion.set(f);
              this.peliculasSvc.getById(f.id_pelicula).subscribe({
                next: (pel) => this.pelicula.set(pel),
                error: () => {},
              });
              this.cinesSvc.getById(f.id_cine).subscribe({
                next: (cine) => this.cine.set(cine),
                error: () => {},
              });
            },
            error: () => {},
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.detalleError.set(extractMessage(err));
      },
    });
  }

  brandLabel(b: Pago['marca_snapshot']): string {
    switch (b) {
      case 'visa': return 'Visa';
      case 'master': return 'Mastercard';
      case 'amex': return 'Amex';
      case 'discover': return 'Discover';
      default: return 'Tarjeta';
    }
  }

  estadoLabel(e: string): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente de pago';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
      default: return e;
    }
  }

  salaNombre(): string {
    const c = this.cine();
    const f = this.funcion();
    if (!c || !f) return '';
    return c.salas.find((s) => s.id === f.id_sala)?.nombre ?? '';
  }

  canCancel(): boolean {
    const r = this.reserva();
    if (!r) return false;
    return r.estado === 'pagada' || r.estado === 'pendiente_pago';
  }
  canSendTicket(): boolean { return this.reserva()?.estado === 'pagada'; }
  canMarkAttendance(): boolean { return this.reserva()?.estado === 'pagada'; }
  canResendRefund(): boolean { return this.reserva()?.estado === 'reembolsada'; }

  back() {
    this.router.navigate(['/admin/reservas']);
  }

  reenviar() {
    const email = this.cliente()?.email ?? '';
    this.showToast(`Boleto reenviado a ${email}`);
  }

  reenviarReembolso() {
    const email = this.cliente()?.email ?? '';
    this.showToast(`Comprobante de reembolso reenviado a ${email}`);
  }

  marcarAsistencia() {
    this.showToast('Asistencia marcada');
    const r = this.reserva();
    if (r) this.reserva.set({ ...r, updated_at: new Date().toISOString() });
  }

  onNotasChange(r: AdminReservaDetail, event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.reserva.set({ ...r, notas_internas: value });
  }

  expiraTexto(expiraEn: string): string {
    const diff = new Date(expiraEn).getTime() - Date.now();
    if (diff <= 0) return 'expirado';
    const mins = Math.floor(diff / 60_000);
    const secs = Math.floor((diff % 60_000) / 1000);
    return mins > 0 ? `${mins} min ${secs} s` : `${secs} s`;
  }

  expiraUrgente(expiraEn: string): boolean {
    const diff = new Date(expiraEn).getTime() - Date.now();
    return diff > 0 && diff < 3 * 60_000; // less than 3 min
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private showToast(msg: string) {
    this.toastMsg.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(null), 2600);
  }
}
