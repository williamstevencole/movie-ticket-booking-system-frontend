import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideSearch } from '@lucide/angular';

import { PeriodPickerComponent, PeriodValue } from './period-picker.component';
import { Cine, CinesService } from '../services/cines.service';
import { Ciudad, CiudadesService } from '../services/ciudades.service';
import { Pelicula, PeliculasService } from '../services/peliculas.service';
import {
  PoliticaCancelacion,
  PoliticasCancelacionService,
} from '../services/politicas-cancelacion.service';

export type SelectSlot =
  | 'cine'
  | 'ciudad'
  | 'pelicula'
  | 'estado-reserva'
  | 'estado-pago'
  | 'metodo-pago'
  | 'politica-cancelacion';

export interface ReportFiltrosConfig {
  periodo?: boolean;
  search?: { placeholder: string } | false;
  selects?: SelectSlot[];
}

export interface ReportFiltrosValue {
  periodo: PeriodValue | null;
  search: string;
  selects: Partial<Record<SelectSlot, string | null>>;
}

type Opt = { id: string; label: string };

const SLOT_LABEL: Record<SelectSlot, string> = {
  cine: 'Todos los cines',
  ciudad: 'Todas las ciudades',
  pelicula: 'Todas las películas',
  'estado-reserva': 'Todos los estados',
  'estado-pago': 'Todos los estados',
  'metodo-pago': 'Todos los métodos',
  'politica-cancelacion': 'Todas las políticas',
};

const ESTADO_RESERVA_OPTS: Opt[] = [
  { id: 'pendiente_pago', label: 'Pendiente de pago' },
  { id: 'pagada', label: 'Pagada' },
  { id: 'cancelada', label: 'Cancelada' },
  { id: 'reembolsada', label: 'Reembolsada' },
];

const ESTADO_PAGO_OPTS: Opt[] = [
  { id: 'procesando', label: 'Procesando' },
  { id: 'exitoso', label: 'Exitoso' },
  { id: 'rechazado', label: 'Rechazado' },
  { id: 'reembolsado', label: 'Reembolsado' },
];

const METODO_PAGO_OPTS: Opt[] = [
  { id: 'tarjeta', label: 'Tarjeta' },
  { id: 'efectivo', label: 'Efectivo' },
];

@Component({
  selector: 'app-report-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule, PeriodPickerComponent, LucideSearch],
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--s3);
      margin-bottom: var(--s5);
      flex-wrap: wrap;
    }
    .search {
      position: relative;
      flex: 1 1 240px;
      max-width: 320px;
    }
    .search svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-3);
      pointer-events: none;
    }
    .search input {
      width: 100%;
      height: 40px;
      background: var(--bg);
      border: 1px solid var(--border-2);
      color: var(--text);
      border-radius: var(--r);
      padding: 0 var(--s4) 0 38px;
      font: inherit;
      font-size: 13px;
    }
    .search input:focus {
      outline: none;
      border-color: var(--red);
      box-shadow: 0 0 0 3px var(--red-soft);
    }
    .select-filter {
      height: 40px;
      padding: 0 12px;
      border-radius: var(--r);
      background: var(--bg);
      border: 1px solid var(--border-2);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      min-width: 160px;
    }
    .select-filter:hover { border-color: var(--text-3); }
    .select-filter:focus {
      outline: none;
      border-color: var(--red);
      box-shadow: 0 0 0 3px var(--red-soft);
    }
  `],
  template: `
    <section class="toolbar">
      @if (config.periodo) {
        <app-period-picker
          [value]="periodValue"
          (valueChange)="onPeriodoChange($event)"
        />
      }

      @if (config.search) {
        <label class="search">
          <svg lucideSearch [size]="14"></svg>
          <input
            type="text"
            [placeholder]="config.search.placeholder"
            [ngModel]="searchValue"
            (ngModelChange)="onSearchInput($event)"
          />
        </label>
      }

      @for (slot of config.selects ?? []; track slot) {
        <select
          class="select-filter"
          [value]="selectsValue[slot] ?? ''"
          (change)="onSelectChange(slot, $event)"
        >
          <option value="">{{ slotPlaceholder(slot) }}</option>
          @for (opt of optionsFor(slot); track opt.id) {
            <option [value]="opt.id">{{ opt.label }}</option>
          }
        </select>
      }
    </section>
  `,
})
export class ReportFiltrosComponent implements OnInit, OnDestroy {
  @Input() config: ReportFiltrosConfig = {};
  @Input() value: ReportFiltrosValue = {
    periodo: null,
    search: '',
    selects: {},
  };
  @Output() valueChange = new EventEmitter<ReportFiltrosValue>();

  private cines = inject(CinesService);
  private ciudades = inject(CiudadesService);
  private peliculas = inject(PeliculasService);
  private politicas = inject(PoliticasCancelacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cinesOpts: Opt[] = [];
  ciudadesOpts: Opt[] = [];
  peliculasOpts: Opt[] = [];
  politicasOpts: Opt[] = [];

  periodValue: PeriodValue = { preset: '30d', from: '', to: '' };
  searchValue = '';
  selectsValue: Partial<Record<SelectSlot, string | null>> = {};

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;
  private ready = false;

  ngOnInit(): void {
    // Load remote opts as needed
    const selects = this.config.selects ?? [];
    if (selects.includes('cine')) {
      this.cines.list().subscribe((page) => {
        this.cinesOpts = page.data.map((c: Cine) => ({
          id: c.id,
          label: c.nombre,
        }));
      });
    }
    if (selects.includes('ciudad')) {
      this.ciudades.list().subscribe((rows: Ciudad[]) => {
        this.ciudadesOpts = rows.map((c) => ({ id: c.id, label: c.nombre }));
      });
    }
    if (selects.includes('pelicula')) {
      this.peliculas.list({ limit: 100 }).subscribe((page) => {
        this.peliculasOpts = page.data.map((p) => ({ id: p.id, label: p.titulo }));
      });
    }
    if (selects.includes('politica-cancelacion')) {
      this.politicas.list().subscribe((rows: PoliticaCancelacion[]) => {
        this.politicasOpts = rows.map((p) => ({ id: p.id, label: p.nombre }));
      });
    }

    // Hydrate from querystring
    const qp = this.route.snapshot.queryParamMap;

    if (this.config.periodo) {
      const preset = (qp.get('periodo') as PeriodValue['preset'] | null) ?? null;
      const from = qp.get('from') ?? '';
      const to = qp.get('to') ?? '';
      if (preset) {
        this.periodValue = { preset, from, to };
      } else if (this.value.periodo) {
        this.periodValue = { ...this.value.periodo };
      }
    }

    if (this.config.search) {
      this.searchValue = qp.get('search') ?? this.value.search ?? '';
    }

    for (const slot of selects) {
      const fromUrl = qp.get(slot);
      this.selectsValue[slot] = fromUrl ?? this.value.selects?.[slot] ?? null;
    }

    // Defer ready flag past the child PeriodPicker's own ngOnInit emission,
    // so its initial setPreset() doesn't trigger router.navigate (which would
    // scroll to top because of scrollPositionRestoration: 'top').
    queueMicrotask(() => { this.ready = true; });
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  optionsFor(slot: SelectSlot): Opt[] {
    switch (slot) {
      case 'cine':
        return this.cinesOpts;
      case 'ciudad':
        return this.ciudadesOpts;
      case 'pelicula':
        return this.peliculasOpts;
      case 'politica-cancelacion':
        return this.politicasOpts;
      case 'estado-reserva':
        return ESTADO_RESERVA_OPTS;
      case 'estado-pago':
        return ESTADO_PAGO_OPTS;
      case 'metodo-pago':
        return METODO_PAGO_OPTS;
    }
  }

  slotPlaceholder(slot: SelectSlot): string {
    return SLOT_LABEL[slot];
  }

  onPeriodoChange(v: PeriodValue) {
    this.periodValue = v;
    this.emit();
    if (this.ready) this.writeUrl();
  }

  onSearchInput(v: string) {
    this.searchValue = v;
    this.emit();
    if (!this.ready) return;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.writeUrl();
    }, 200);
  }

  onSelectChange(slot: SelectSlot, ev: Event) {
    const v = (ev.target as HTMLSelectElement).value;
    this.selectsValue[slot] = v === '' ? null : v;
    this.emit();
    if (this.ready) this.writeUrl();
  }

  private emit() {
    const next: ReportFiltrosValue = {
      periodo: this.config.periodo ? { ...this.periodValue } : null,
      search: this.config.search ? this.searchValue : '',
      selects: { ...this.selectsValue },
    };
    this.valueChange.emit(next);
  }

  private writeUrl() {
    const queryParams: Record<string, string | null> = {};

    if (this.config.periodo) {
      queryParams['periodo'] = this.periodValue.preset || null;
      queryParams['from'] = this.periodValue.from || null;
      queryParams['to'] = this.periodValue.to || null;
    }

    if (this.config.search) {
      queryParams['search'] = this.searchValue ? this.searchValue : null;
    }

    for (const slot of this.config.selects ?? []) {
      const v = this.selectsValue[slot];
      queryParams[slot] = v ? v : null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
