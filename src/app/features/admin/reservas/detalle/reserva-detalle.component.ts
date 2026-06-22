import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@lucide/angular';

import {
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../../../shared/services/reservas.service';
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

type TimelineKind = 'created' | 'blocked' | 'paid' | 'cancelled' | 'refunded' | 'expired';

interface TimelineEvent {
  kind: TimelineKind;
  title: string;
  detail: string;
  at: string;
}

type Motivo = 'cliente' | 'pago_rechazado' | 'duplicada' | 'sala_cerrada' | 'otro';

@Component({
  selector: 'app-admin-reserva-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  ],
  templateUrl: './reserva-detalle.component.html',
  styleUrls: ['../operaciones.shared.scss', './reserva-detalle.component.scss'],
})
export class AdminReservaDetalleComponent {
  private reservasSvc = inject(ReservasService);
  private pagosSvc = inject(PagosService);
  private funcionesSvc = inject(FuncionesService);
  private peliculasSvc = inject(PeliculasService);
  private cinesSvc = inject(CinesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly reserva = signal<Reserva | null>(null);
  readonly notFound = signal(false);
  readonly cliente = signal<ReservaUsuario | null>(null);
  readonly pago = signal<Pago | null>(null);
  readonly funcion = signal<Funcion | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);
  readonly cine = signal<Cine | null>(null);

  readonly cancelOpen = signal(false);
  readonly motivo = signal<Motivo>('cliente');
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
      detail: r.asientos_codigos?.length
        ? `${r.asientos_codigos.join(', ')} reservados por 15 minutos`
        : 'Asientos retenidos por 15 minutos',
      at: r.created_at,
    });
    const pago = this.pago();
    if (r.estado === 'pagada' || r.estado === 'cancelada' || r.estado === 'reembolsada') {
      const metodoLabel = pago
        ? pago.metodo === 'tarjeta' && pago.tarjeta_mask
          ? `${this.brandLabel(pago.tarjeta_brand)} ${pago.tarjeta_mask}`
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

  readonly cancelPercent = computed(() => {
    const r = this.reserva();
    if (!r) return 0;
    const m = this.motivo();
    if (m === 'pago_rechazado' || m === 'sala_cerrada') return 100;
    if (m === 'duplicada') return 100;
    if (m === 'cliente') return 80;
    return 70;
  });
  readonly cancelMonto = computed(() =>
    Math.round(((this.reserva()?.monto_total ?? 0) * this.cancelPercent()) / 100),
  );

  readonly motivos: { id: Motivo; label: string }[] = [
    { id: 'cliente', label: 'Solicitud del cliente' },
    { id: 'pago_rechazado', label: 'Pago rechazado por banco' },
    { id: 'duplicada', label: 'Reserva duplicada' },
    { id: 'sala_cerrada', label: 'Sala cerrada / función no realizada' },
    { id: 'otro', label: 'Otro' },
  ];

  constructor() {
    this.route.paramMap.subscribe((p) => this.load(p.get('id')));
    this.route.fragment.subscribe((frag) => {
      if (frag === 'cancel') {
        setTimeout(() => this.cancelOpen.set(true), 60);
      }
    });
  }

  private load(id: string | null) {
    if (!id) {
      this.notFound.set(true);
      return;
    }
    this.reservasSvc.getById(id).subscribe((r) => {
      if (!r) {
        this.notFound.set(true);
        return;
      }
      this.reserva.set(r);
      this.reservasSvc.getUsuario(r.id_usuario).subscribe((u) => this.cliente.set(u ?? null));
      this.pagosSvc.getByReserva(r.id).subscribe((p) => this.pago.set(p ?? null));
      this.funcionesSvc.list().subscribe((funcs) => {
        const f = funcs.find((x) => x.id === r.id_funcion);
        if (!f) return;
        this.funcion.set(f);
        this.peliculasSvc.list().subscribe((peliculas) =>
          this.pelicula.set(peliculas.find((p) => p.id === f.id_pelicula) ?? null),
        );
        this.cinesSvc.list().subscribe((cines) =>
          this.cine.set(cines.data.find((c) => c.id === f.id_cine) ?? null),
        );
      });
    });
  }

  brandLabel(b: Pago['tarjeta_brand']): string {
    switch (b) {
      case 'visa': return 'Visa';
      case 'master': return 'Mastercard';
      case 'amex': return 'Amex';
      case 'discover': return 'Discover';
      default: return 'Tarjeta';
    }
  }

  estadoLabel(e: Reserva['estado']): string {
    switch (e) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente de pago';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
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

  openCancel() {
    this.cancelOpen.set(true);
    setTimeout(() => {
      document
        .querySelector('.cancel-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }
  closeCancel() {
    this.cancelOpen.set(false);
  }
  confirmCancel() {
    const r = this.reserva();
    if (!r) return;
    const monto = this.cancelMonto();
    const isRefund = monto > 0 && r.estado === 'pagada';
    const next = isRefund ? 'reembolsada' : 'cancelada';
    this.reserva.set({
      ...r,
      estado: next as Reserva['estado'],
      updated_at: new Date().toISOString(),
      notas_internas: `${this.motivos.find((m) => m.id === this.motivo())?.label}${
        isRefund ? ` · reembolso ${this.cancelPercent()}% (L ${monto})` : ''
      }`,
    });
    this.cancelOpen.set(false);
    this.showToast(
      isRefund
        ? `Reserva cancelada · L ${monto} reembolsados`
        : `Reserva cancelada`,
    );
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private showToast(msg: string) {
    this.toastMsg.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(null), 2600);
  }
}
