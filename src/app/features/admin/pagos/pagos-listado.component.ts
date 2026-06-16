import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucideCreditCard,
  LucideBanknote,
  LucideArrowUpRight,
  LucideUndo2,
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
  Reembolso,
  ReembolsosService,
} from '../../../shared/services/reembolsos.service';
import {
  Funcion,
  FuncionesService,
} from '../../../shared/services/funciones.service';
import { Cine, CinesService } from '../../../shared/services/cines.service';
import {
  Ciudad,
  CiudadesService,
} from '../../../shared/services/ciudades.service';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar.component';
import { PagerComponent } from '../../../shared/components/pager.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../shared/components/export-button.component';

type FilterEstado = 'all' | EstadoPago;
type FilterMetodo = 'all' | 'tarjeta' | 'efectivo';
type Preset = '7d' | '30d' | 'mes' | 'all' | 'custom';

@Component({
  selector: 'app-admin-pagos-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    AdminSidebarComponent,
    PagerComponent,
    ExportButtonComponent,
    LucideSearch,
    LucideCreditCard,
    LucideBanknote,
    LucideArrowUpRight,
    LucideUndo2,
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
  private reembolsosSvc = inject(ReembolsosService);
  private funcionesSvc = inject(FuncionesService);
  private cinesSvc = inject(CinesService);
  private ciudadesSvc = inject(CiudadesService);
  private router = inject(Router);

  readonly pagos = signal<Pago[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly usuarios = signal<ReservaUsuario[]>([]);
  readonly reembolsos = signal<Reembolso[]>([]);
  readonly funciones = signal<Funcion[]>([]);
  readonly cines = signal<Cine[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);

  readonly searchTerm = signal('');
  readonly filterEstado = signal<FilterEstado>('all');
  readonly filterMetodo = signal<FilterMetodo>('all');
  readonly idCiudad = signal<string>('');
  readonly idCine = signal<string>('');
  readonly preset = signal<Preset>('30d');
  readonly page = signal(1);
  readonly pageSize = signal(15);

  customFrom = '';
  customTo = '';

  readonly filtrosEstado: { id: FilterEstado; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'exitoso', label: 'Exitosos' },
    { id: 'reembolsado', label: 'Reembolsados' },
    { id: 'rechazado', label: 'Rechazados' },
    { id: 'procesando', label: 'Procesando' },
  ];
  readonly filtrosMetodo: { id: FilterMetodo; label: string }[] = [
    { id: 'all', label: 'Todos los métodos' },
    { id: 'tarjeta', label: 'Tarjeta' },
    { id: 'efectivo', label: 'Efectivo' },
  ];

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
  readonly cinesEnCiudad = computed(() => {
    const c = this.idCiudad();
    return c ? this.cines().filter((x) => x.id_ciudad === c) : this.cines();
  });

  readonly range = computed<{ from: number; to: number }>(() => {
    const now = Date.now();
    switch (this.preset()) {
      case '7d':
        return { from: now - 7 * 86_400_000, to: now };
      case '30d':
        return { from: now - 30 * 86_400_000, to: now };
      case 'mes': {
        const d = new Date();
        return {
          from: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
          to: now,
        };
      }
      case 'all':
        return { from: -Infinity, to: Infinity };
      case 'custom':
        return {
          from: this.customFrom ? new Date(this.customFrom).getTime() : -Infinity,
          to: this.customTo
            ? new Date(this.customTo).getTime() + 86_400_000
            : Infinity,
        };
    }
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
    const term = this.searchTerm().trim().toLowerCase();
    const fe = this.filterEstado();
    const fm = this.filterMetodo();
    const ciudad = this.idCiudad();
    const cine = this.idCine();
    const { from, to } = this.range();
    const cinesOfCiudad = ciudad
      ? new Set(
          this.cines().filter((c) => c.id_ciudad === ciudad).map((c) => c.id),
        )
      : null;
    return this.pagos().filter((p) => {
      const ts = new Date(p.created_at).getTime();
      if (ts < from || ts > to) return false;
      if (fe !== 'all' && p.estado !== fe) return false;
      if (fm !== 'all' && p.metodo !== fm) return false;
      if (cinesOfCiudad || cine) {
        const cineId = this.cineIdDe(p);
        if (!cineId) return false;
        if (cinesOfCiudad && !cinesOfCiudad.has(cineId)) return false;
        if (cine && cineId !== cine) return false;
      }
      if (term) {
        const r = this.reservasById().get(p.id_reserva);
        const u = r ? this.usuariosById().get(r.id_usuario) : undefined;
        const hit =
          (p.referencia_externa?.toLowerCase().includes(term) ?? false) ||
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
    return this.reembolsos().filter((r) => pagoIds.has(r.id_pago));
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
    this.pagosSvc.list().subscribe((d) => this.pagos.set(d));
    this.reservasSvc.list().subscribe((d) => this.reservas.set(d));
    this.reservasSvc.listUsuarios().subscribe((d) => this.usuarios.set(d));
    this.reembolsosSvc.list().subscribe((d) => this.reembolsos.set(d));
    this.funcionesSvc.list().subscribe((d) => this.funciones.set(d));
    this.cinesSvc.list().subscribe((d) => this.cines.set(d.data));
    this.ciudadesSvc.list().subscribe((d) => this.ciudades.set(d));

    effect(() => {
      const total = this.filtered().length;
      const max = Math.max(1, Math.ceil(total / this.pageSize()));
      if (this.page() > max) this.page.set(max);
    });
  }

  setPreset(p: Preset) {
    this.preset.set(p);
    this.page.set(1);
  }
  onCustomChange() {
    this.page.set(1);
  }
  setEstado(f: FilterEstado) {
    this.filterEstado.set(f);
    this.page.set(1);
  }
  setMetodo(f: FilterMetodo) {
    this.filterMetodo.set(f);
    this.page.set(1);
  }
  onCiudadChange(e: Event) {
    this.idCiudad.set((e.target as HTMLSelectElement).value);
    this.idCine.set('');
    this.page.set(1);
  }
  onCineChange(e: Event) {
    this.idCine.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  reset() {
    this.filterEstado.set('all');
    this.filterMetodo.set('all');
    this.idCiudad.set('');
    this.idCine.set('');
    this.searchTerm.set('');
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

  brandLabel(b: Pago['tarjeta_brand']): string {
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
