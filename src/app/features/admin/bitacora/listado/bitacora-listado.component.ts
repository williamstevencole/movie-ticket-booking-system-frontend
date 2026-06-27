import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  LucideNotebookText,
  LucideRotateCcw,
  LucideFilter,
} from '@lucide/angular';

import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import {
  ExportButtonComponent,
  ExportColumn,
} from '../../../../shared/components/export-button.component';
import { PagerComponent } from '../../../../shared/components/pager.component';
import { BitacoraService } from '../bitacora.service';
import {
  AuditLogItem,
  AuditLogListResponse,
  AuditLogQuery,
} from '../bitacora.types';
import { ENTITY_LABELS } from '../bitacora-labels';
import { extractMessage } from '../../../../shared/utils/http-errors';

interface FilterState {
  accion: string[];
  entidad: string;
  fecha_desde: string;
  fecha_hasta: string;
  page: number;
  page_size: number;
}

const DEFAULT_FILTERS: FilterState = {
  accion: [],
  entidad: '',
  fecha_desde: '',
  fecha_hasta: '',
  page: 1,
  page_size: 20,
};

@Component({
  selector: 'app-admin-bitacora-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterOutlet,
    DatePipe,
    AdminSidebarComponent,
    ExportButtonComponent,
    PagerComponent,
    LucideNotebookText,
    LucideRotateCcw,
    LucideFilter,
  ],
  templateUrl: './bitacora-listado.component.html',
  styleUrl: './bitacora-listado.component.scss',
})
export class BitacoraListadoComponent {
  private svc = inject(BitacoraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly entityOptions = Object.keys(ENTITY_LABELS).map((key) => ({
    key,
    label: ENTITY_LABELS[key].entidad,
  }));

  readonly exportColumns: ExportColumn<AuditLogItem>[] = [
    { key: 'fecha', label: 'Fecha', value: (r) => r.created_at },
    { key: 'auditor', label: 'Auditor', value: (r) => r.auditor.nombre },
    { key: 'email', label: 'Email auditor', value: (r) => r.auditor.email },
    { key: 'accion', label: 'Acción', value: (r) => r.accion },
    {
      key: 'entidad',
      label: 'Entidad',
      value: (r) => (r.entidad ? this.entidadLabel(r.entidad) : ''),
    },
    { key: 'entidad_id', label: 'ID entidad', value: (r) => r.entidad_id ?? '' },
    { key: 'detalle', label: 'Detalle', value: (r) => r.detalle ?? '' },
  ];

  readonly loading = signal(false);
  readonly listError = signal<string | null>(null);
  readonly data = signal<AuditLogListResponse | null>(null);

  readonly filters = signal<FilterState>({ ...DEFAULT_FILTERS });

  // Local form state (does not trigger a fetch until "Aplicar" is pressed)
  readonly draftEntidad = signal('');
  readonly draftDesde = signal('');
  readonly draftHasta = signal('');

  readonly total = computed(() => this.data()?.total ?? 0);
  readonly items = computed(() => this.data()?.items ?? []);
  readonly page = computed(() => this.filters().page);
  readonly pageSize = computed(() => this.filters().page_size);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  readonly rangeFrom = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  readonly rangeTo = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );

  constructor() {
    // Hydrate filters from URL on init and on every queryParam change
    this.route.queryParams.subscribe((qp) => {
      const accionRaw = qp['accion'];
      const accion = Array.isArray(accionRaw)
        ? accionRaw
        : accionRaw
          ? String(accionRaw).split(',').filter(Boolean)
          : [];

      const next: FilterState = {
        accion,
        entidad: qp['entidad'] ?? '',
        fecha_desde: qp['fecha_desde'] ?? '',
        fecha_hasta: qp['fecha_hasta'] ?? '',
        page: Number(qp['page'] ?? 1) || 1,
        page_size: Number(qp['page_size'] ?? 20) || 20,
      };

      this.filters.set(next);
      this.draftEntidad.set(next.entidad);
      this.draftDesde.set(next.fecha_desde);
      this.draftHasta.set(next.fecha_hasta);
    });

    // Re-fetch whenever filters change
    effect(() => {
      const f = this.filters();
      this.fetch(f);
    });
  }

  private fetch(f: FilterState) {
    this.loading.set(true);
    this.listError.set(null);
    const q: AuditLogQuery = {
      page: f.page,
      page_size: f.page_size,
    };
    if (f.accion.length) q.accion = f.accion;
    if (f.entidad) q.entidad = f.entidad;
    if (f.fecha_desde) q.fecha_desde = f.fecha_desde;
    if (f.fecha_hasta) q.fecha_hasta = f.fecha_hasta;

    this.svc.list(q).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.listError.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }

  retryList() {
    this.fetch(this.filters());
  }

  aplicar() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        entidad: this.draftEntidad() || null,
        fecha_desde: this.draftDesde() || null,
        fecha_hasta: this.draftHasta() || null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  limpiar() {
    this.draftEntidad.set('');
    this.draftDesde.set('');
    this.draftHasta.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        entidad: null,
        fecha_desde: null,
        fecha_hasta: null,
        accion: null,
        page: null,
        page_size: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: p },
      queryParamsHandling: 'merge',
    });
  }

  onPageSizeChange(size: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page_size: size, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  entidadLabel(entidad: string | null): string {
    if (!entidad) return '—';
    return ENTITY_LABELS[entidad]?.entidad ?? entidad;
  }

  accionVariant(accion: string): string {
    if (accion.endsWith('_CREAR')) return 'crear';
    if (
      accion.endsWith('_EDITAR') ||
      accion.endsWith('_ACTUALIZAR') ||
      accion.endsWith('_TOGGLE') ||
      accion.endsWith('_TOGGLE_ESTADO') ||
      accion.endsWith('_TOGGLE_NOTIFICACIONES') ||
      accion.endsWith('_EDITAR_PASSWORD') ||
      accion.endsWith('_APROBAR') ||
      accion.endsWith('_PROCESAR')
    ) return 'editar';
    if (accion.endsWith('_ELIMINAR') || accion.endsWith('_CANCELAR')) return 'eliminar';
    if (accion === 'LOGIN' || accion === 'LOGOUT') return 'auth';
    return 'neutro';
  }
}
