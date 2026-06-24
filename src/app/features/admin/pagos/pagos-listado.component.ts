import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCreditCard,
  LucideBanknote,
  LucideArrowUpRight,
} from '@lucide/angular';

import {
  EstadoPago,
  Pago,
  PagosService,
} from '../../../shared/services/pagos.service';
import {
  Reserva,
  ReservaUsuario,
  ReservasService,
} from '../../../shared/services/reservas.service';
import {
  AdminReembolsosService,
  AdminReembolsoRow as Reembolso,
} from '../../../shared/services/admin-reembolsos.service';
import {
  Funcion,
  FuncionesService,
} from '../../../shared/services/funciones.service';
import { Cine, CinesService } from '../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../shared/components/pager.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../shared/components/export-button.component';
import {
  ReportFiltrosComponent,
  ReportFiltrosValue,
} from '../../../shared/components/report-filtros.component';

@Component({
  selector: 'app-admin-pagos-listado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    ExportButtonComponent,
    ReportFiltrosComponent,
    LucideCreditCard,
    LucideBanknote,
    LucideArrowUpRight,
  ],
  templateUrl: './pagos-listado.component.html',
  styleUrls: [
    '../reservas/operaciones.shared.scss',
    './pagos-listado.component.scss',
  ],
})
export class AdminPagosListadoComponent {
  private pagosSvc = inject(PagosService);
  private reservasSvc = inject(ReservasService);
  private reembolsosSvc = inject(AdminReembolsosService);
  private funcionesSvc = inject(FuncionesService);
  private cinesSvc = inject(CinesService);
  private router = inject(Router);

  readonly pagos = signal<Pago[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly usuarios = signal<ReservaUsuario[]>([]);
  readonly reembolsos = signal<Reembolso[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly cines = signal<Cine[]>([]);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly page = signal(1);
  readonly pageSize = signal(15);

  readonly exportColumns: ExportColumn<Pago>[] = [
    { key: 'referencia', label: 'Referencia', value: (p) => p.referencia_externa ?? `EFEC-${p.id}` },
    { key: 'reserva', label: 'Reserva', value: (p) => this.reservaNumero(p.id_reserva) },
    { key: 'cliente', label: 'Cliente', value: (p) => this.clienteNombre(p.id_reserva) },
    { key: 'email', label: 'Email', value: (p) => this.clienteEmail(p.id_reserva) },
    { key: 'cine', label: 'Cine', value: (p) => this.cineNombrePorPago(p) },
    { key: 'metodo', label: 'Método', value: (p) => p.metodo },
    { key: 'original', label: 'Original', value: (p) => p.monto_original },
    { key: 'descuento', label: 'Descuento', value: (p) => p.monto_descuento },
    { key: 'final', label: 'Final', value: (p) => p.monto_final },
    { key: 'estado', label: 'Estado', value: (p) => p.estado },
    { key: 'created_at', label: 'Fecha', value: (p) => p.created_at },
  ];

  readonly reservasById = computed(() => {
    const m = new Map<string, Reserva>();
    for (const r of this.reservas()) m.set(r.id, r);
    return m;
  });
  readonly usuariosById = computed(() => {
    const m = new Map<string, ReservaUsuario>();
    for (const u of this.usuarios()) m.set(u.id, u);
    return m;
  });
  readonly funcionesById = computed(() => {
    const m = new Map<string, Funcion>();
    for (const f of this.funciones()) m.set(f.id, f);
    return m;
  });
  readonly cinesById = computed(() => {
    const m = new Map<string, Cine>();
    for (const c of this.cines()) m.set(c.id, c);
    return m;
  });
  readonly pagosById = computed(() => {
    const m = new Map<string, Pago>();
    for (const p of this.pagos()) m.set(p.id, p);
    return m;
  });

  private cineIdDe(p: Pago): string | null {
    const r = this.reservasById().get(p.id_reserva);
    if (!r) return null;
    const f = this.funcionesById().get(r.id_funcion);
    return f?.id_cine ?? null;
  }

  cineNombrePorPago(p: Pago): string {
    const id = this.cineIdDe(p);
    if (!id) return '—';
    return this.cinesById().get(id)?.nombre ?? '—';
  }

  readonly filtered = computed(() => {
    const f = this.filtros();
    const periodo = f.periodo;
    let fromTs = -Infinity;
    let toTs = Infinity;
    if (periodo) {
      const now = Date.now();
      switch (periodo.preset) {
        case '7d':
          fromTs = now - 7 * 86_400_000;
          toTs = now;
          break;
        case '30d':
          fromTs = now - 30 * 86_400_000;
          toTs = now;
          break;
        case 'mes': {
          const d = new Date();
          fromTs = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
          toTs = now;
          break;
        }
        case 'custom':
          fromTs = periodo.from ? new Date(periodo.from).getTime() : -Infinity;
          toTs = periodo.to ? new Date(periodo.to + 'T23:59:59').getTime() : Infinity;
          break;
      }
    }

    const term = (f.search || '').toLowerCase().trim();
    const cine = f.selects['cine'] ?? null;
    const estado = (f.selects['estado-pago'] ?? null) as EstadoPago | null;
    const metodo = f.selects['metodo-pago'] ?? null;

    return this.pagos().filter((p) => {
      const ts = new Date(p.created_at).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (estado && p.estado !== estado) return false;
      if (metodo && p.metodo !== metodo) return false;
      if (cine) {
        const cineId = this.cineIdDe(p);
        if (!cineId || cineId !== cine) return false;
      }
      if (term) {
        const r = this.reservasById().get(p.id_reserva);
        const u = r ? this.usuariosById().get(r.id_usuario) : undefined;
        const hit =
          (p.referencia_externa?.toLowerCase().includes(term) ?? false) ||
          p.id.toLowerCase().includes(term) ||
          p.id_reserva.toLowerCase().includes(term) ||
          (r?.numero_reserva.toLowerCase().includes(term) ?? false) ||
          (u?.nombre.toLowerCase().includes(term) ?? false) ||
          (u?.email.toLowerCase().includes(term) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  });

  readonly paged = computed(() => {
    const all = this.filtered();
    const start = (this.page() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  readonly filteredReembolsos = computed(() => {
    const pagoIds = new Set(this.filtered().map((p) => p.id));
    return this.reembolsos().filter((r) => r.id_pago != null && pagoIds.has(r.id_pago));
  });

  readonly kpis = computed(() => {
    let cobrado = 0;
    let descuentos = 0;
    let reembolsado = 0;
    let exitosos = 0;
    for (const p of this.filtered()) {
      if (p.estado === 'exitoso') {
        cobrado += p.monto_final;
        descuentos += p.monto_descuento;
        exitosos++;
      } else if (p.estado === 'reembolsado') {
        reembolsado += p.monto_final;
      }
    }
    return { cobrado, descuentos, reembolsado, neto: cobrado - reembolsado, exitosos };
  });

  readonly totals = this.kpis;

  constructor() {
    this.pagosSvc.list().subscribe((d) => this.pagos.set(d.data));
    this.reservasSvc.list().subscribe((d) => this.reservas.set(d));
    this.reservasSvc.listUsuarios().subscribe((d) => this.usuarios.set(d));
    this.reembolsosSvc.list().subscribe((res) => this.reembolsos.set(res.data));
    this.funcionesSvc.list().subscribe((d) => this.funciones.set(d));
    this.cinesSvc.list().subscribe((d) => this.cines.set(d.data));

    effect(() => {
      const total = this.filtered().length;
      const max = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > max) this.page.set(max);
    });
  }

  onFiltrosChange(v: ReportFiltrosValue) {
    this.filtros.set(v);
    this.page.set(1);
  }

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.page.set(1);
  }

  openReserva(id: string) {
    this.router.navigate(['/admin/reservas', id]);
  }

  reservaNumero(idReserva: string): string {
    return this.reservasById().get(idReserva)?.numero_reserva ?? '—';
  }
  clienteNombre(idReserva: string): string {
    const r = this.reservasById().get(idReserva);
    if (!r) return '—';
    return this.usuariosById().get(r.id_usuario)?.nombre ?? '—';
  }
  clienteEmail(idReserva: string): string {
    const r = this.reservasById().get(idReserva);
    if (!r) return '';
    return this.usuariosById().get(r.id_usuario)?.email ?? '';
  }

  reservaPorPago(idPago: string): string {
    const p = this.pagosById().get(idPago);
    if (!p) return '—';
    return this.reservaNumero(p.id_reserva);
  }
  clientePorPago(idPago: string): string {
    const p = this.pagosById().get(idPago);
    if (!p) return '—';
    return this.clienteNombre(p.id_reserva);
  }
  reservaIdPorPago(idPago: string): string | null {
    return this.pagosById().get(idPago)?.id_reserva ?? null;
  }

  brandLabel(b: Pago['marca_snapshot']): string {
    switch (b) {
      case 'visa': return 'Visa';
      case 'master': return 'MC';
      case 'amex': return 'Amex';
      case 'discover': return 'Discover';
      default: return '';
    }
  }

  estadoLabel(e: EstadoPago): string {
    switch (e) {
      case 'exitoso': return 'Exitoso';
      case 'reembolsado': return 'Reembolsado';
      case 'rechazado': return 'Rechazado';
      case 'procesando': return 'Procesando';
    }
  }
}
