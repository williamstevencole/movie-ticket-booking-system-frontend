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
  PagoAdminRow,
  PagosService,
} from '../../../shared/services/pagos.service';
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
import { extractMessage } from '../../../shared/utils/http-errors';

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
  private router = inject(Router);

  readonly pagos = signal<PagoAdminRow[]>([]);
  readonly pagosLoading = signal(true);
  readonly pagosError = signal<string | null>(null);

  readonly filtros = signal<ReportFiltrosValue>({
    periodo: { preset: '30d', from: '', to: '' },
    search: '',
    selects: {},
  });

  readonly page = signal(1);
  readonly pageSize = signal(15);

  readonly exportColumns: ExportColumn<PagoAdminRow>[] = [
    { key: 'referencia', label: 'Referencia', value: (p) => p.referencia_externa ?? `EFEC-${p.id}` },
    { key: 'reserva', label: 'Reserva', value: (p) => p.numero_reserva ?? '—' },
    { key: 'cliente', label: 'Cliente', value: (p) => p.cliente?.nombre ?? '—' },
    { key: 'email', label: 'Email', value: (p) => p.cliente?.email ?? '' },
    { key: 'cine', label: 'Cine', value: (p) => p.cine?.nombre ?? '—' },
    { key: 'metodo', label: 'Método', value: (p) => p.metodo },
    { key: 'original', label: 'Original', value: (p) => p.monto_original },
    { key: 'descuento', label: 'Descuento', value: (p) => p.monto_descuento },
    { key: 'final', label: 'Final', value: (p) => p.monto_final },
    { key: 'estado', label: 'Estado', value: (p) => p.estado },
    { key: 'created_at', label: 'Fecha', value: (p) => p.created_at },
  ];

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
    const cineFilter = f.selects['cine'] ?? null;
    const estado = (f.selects['estado-pago'] ?? null) as EstadoPago | null;
    const metodo = f.selects['metodo-pago'] ?? null;

    return this.pagos().filter((p) => {
      const ts = new Date(p.created_at).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (estado && p.estado !== estado) return false;
      if (metodo && p.metodo !== metodo) return false;
      if (cineFilter) {
        if (!p.cine || p.cine.id !== cineFilter) return false;
      }
      if (term) {
        const hit =
          (p.referencia_externa?.toLowerCase().includes(term) ?? false) ||
          p.id.toLowerCase().includes(term) ||
          p.id_reserva.toLowerCase().includes(term) ||
          (p.numero_reserva?.toLowerCase().includes(term) ?? false) ||
          (p.cliente?.nombre.toLowerCase().includes(term) ?? false) ||
          (p.cliente?.email.toLowerCase().includes(term) ?? false);
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

  readonly filteredReembolsos = computed(() =>
    this.filtered().filter((p) => p.estado === 'reembolsado'),
  );

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
    this.cargarPagos();

    effect(() => {
      const total = this.filtered().length;
      const max = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > max) this.page.set(max);
    });
  }

  cargarPagos(): void {
    this.pagosLoading.set(true);
    this.pagosError.set(null);
    this.pagosSvc.list({ limit: 500 }).subscribe({
      next: (res) => {
        this.pagos.set(res.data);
        this.pagosLoading.set(false);
      },
      error: (err) => {
        this.pagosError.set(extractMessage(err));
        this.pagosLoading.set(false);
      },
    });
  }

  reloadPagos(): void {
    this.cargarPagos();
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

  reservaNumero(p: PagoAdminRow): string {
    return p.numero_reserva ?? '—';
  }

  clienteNombre(p: PagoAdminRow): string {
    return p.cliente?.nombre ?? '—';
  }

  clienteEmail(p: PagoAdminRow): string {
    return p.cliente?.email ?? '';
  }

  cineNombrePorPago(p: PagoAdminRow): string {
    return p.cine?.nombre ?? '—';
  }

  brandLabel(b: PagoAdminRow['marca_snapshot']): string {
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
