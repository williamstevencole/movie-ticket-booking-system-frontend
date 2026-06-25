import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideInfo, LucideGrid3x3 } from '@lucide/angular';

import { Cine, CinesService } from '../../../../shared/services/cines.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

type SeatType = 'std' | 'vip' | 'acc';
type SeatCell = { label: string; type: SeatType };
type SeatRow = { label: string; seats: SeatCell[] };

@Component({
  selector: 'app-admin-sala-distribucion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebarComponent,
    LucideInfo,
    LucideGrid3x3,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <div class="crumb">
            <a routerLink="/admin">Admin</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/admin/salas">Salas</a>
            <span aria-hidden="true">·</span>
            <span class="crumb-current">Distribución</span>
          </div>

          @if (loadError()) {
            <div class="head-row">
              <div>
                <h1>Sala no encontrada</h1>
                <p class="lead">{{ loadError() }}</p>
              </div>
            </div>
            <a class="btn btn-primary" routerLink="/admin/salas">Volver a salas</a>
          } @else {
            <div class="head-row">
              <div>
                <h1>{{ salaNombre() }}</h1>
                <p class="lead">
                  {{ cineNombre() }} · {{ filas() }} × {{ columnas() }} ·
                  {{ capacidad() }} asientos
                </p>
              </div>
              <a
                class="btn"
                [routerLink]="['/admin/salas', idCine, idSala, 'editar']"
              >
                <svg lucideGrid3x3 [size]="16"></svg>
                <span>Editar grilla</span>
              </a>
            </div>

            <div class="stage card">
              <div class="screen-zone">
                <div class="screen-bar"></div>
                <div class="screen-lbl">P A N T A L L A</div>
              </div>

              <div class="seats">
                @for (row of seatRows(); track row.label) {
                  <div class="seat-row">
                    <span class="row-lbl">{{ row.label }}</span>
                    @for (seat of row.seats; track seat.label) {
                      <span
                        class="seat"
                        [class.vip]="seat.type === 'vip'"
                        [class.acc]="seat.type === 'acc'"
                        [title]="seat.label"
                      ></span>
                    }
                    <span class="row-lbl">{{ row.label }}</span>
                  </div>
                }
              </div>

              <div class="legend">
                <span class="item"><span class="sw"></span> Estándar · {{ countStd() }}</span>
                <span class="item"><span class="sw vip"></span> VIP · {{ countVip() }}</span>
                <span class="item"><span class="sw acc"></span> Accesible · {{ countAcc() }}</span>
              </div>
            </div>

            <div class="note">
              <svg lucideInfo [size]="14"></svg>
              <span>
                Vista previa ilustrativa. La asignación real de tipos de asiento
                se gestiona en una vista aparte.
              </span>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './distribucion.component.scss',
})
export class AdminSalaDistribucionComponent {
  private route = inject(ActivatedRoute);
  private cinesSvc = inject(CinesService);

  readonly idCine = this.route.snapshot.paramMap.get('cineId') ?? '';
  readonly idSala = this.route.snapshot.paramMap.get('salaId') ?? '';

  readonly cineNombre = signal<string>('');
  readonly salaNombre = signal<string>('Sala');
  readonly filas = signal(0);
  readonly columnas = signal(0);
  readonly loadError = signal<string | null>(null);

  readonly capacidad = computed(() => this.filas() * this.columnas());

  readonly seatRows = computed<SeatRow[]>(() => {
    const filas = this.filas();
    const cols = this.columnas();
    const rows: SeatRow[] = [];
    for (let r = 0; r < filas; r++) {
      const label = this.rowLabel(r);
      const seats: SeatCell[] = [];
      for (let c = 0; c < cols; c++) {
        seats.push({
          label: `${label}${c + 1}`,
          type: this.seatType(r, c, filas, cols),
        });
      }
      rows.push({ label, seats });
    }
    return rows;
  });

  readonly countVip = computed(() => this.countType('vip'));
  readonly countAcc = computed(() => this.countType('acc'));
  readonly countStd = computed(() => this.countType('std'));

  constructor() {
    this.cinesSvc.getById(this.idCine).subscribe({
      next: (cine: Cine) => this.cineNombre.set(cine.nombre),
      error: () => this.cineNombre.set('—'),
    });

    this.cinesSvc.getSala(this.idCine, this.idSala).subscribe({
      next: (sala) => {
        this.salaNombre.set(sala.nombre);
        this.filas.set(sala.filas ?? 0);
        this.columnas.set(sala.columnas ?? 0);
      },
      error: (e) =>
        this.loadError.set(e?.message ?? 'No se pudo cargar la sala'),
    });
  }

  /** Distribución ilustrativa determinista: VIP al fondo, accesibles en esquinas traseras. */
  private seatType(
    row: number,
    col: number,
    filas: number,
    cols: number,
  ): SeatType {
    const isBackRow = row === filas - 1;
    if (isBackRow && filas >= 3 && (col === 0 || col === cols - 1)) {
      return 'acc';
    }
    if (filas >= 4 && row >= filas - 2) {
      return 'vip';
    }
    return 'std';
  }

  private countType(type: SeatType): number {
    let n = 0;
    for (const row of this.seatRows()) {
      for (const seat of row.seats) {
        if (seat.type === type) n++;
      }
    }
    return n;
  }

  private rowLabel(index: number): string {
    if (index < 26) return String.fromCharCode(65 + index);
    return `F${index + 1}`;
  }
}
