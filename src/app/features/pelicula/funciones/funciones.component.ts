import {
  Component,
  Input,
  OnChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  PeliculaCinesService,
  CineFuncionesVM,
  SalaVM,
} from '../../../shared/services/pelicula-cines.service';
import { LocationService } from '../../../shared/services/location.service';
import { DayStripComponent } from '../../cartelera/day-strip/day-strip.component';
import { HorarioChipComponent } from './horario-chip/horario-chip.component';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Clave de día local "YYYY-MM-DD" para alinear con las funciones del backend. */
function diaKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-pelicula-funciones',
  standalone: true,
  imports: [DayStripComponent, HorarioChipComponent],
  templateUrl: './funciones.component.html',
  styleUrl: './funciones.component.scss',
})
export class PeliculaFuncionesComponent implements OnChanges {
  private cinesSvc = inject(PeliculaCinesService);
  private location = inject(LocationService);

  @Input({ required: true }) peliculaId!: string;

  readonly cines = signal<CineFuncionesVM[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly selectedCineId = signal<string | null>(null);
  readonly selectedDia = signal<string>(diaKey(new Date()));

  readonly selectedCine = computed<CineFuncionesVM | null>(() => {
    const list = this.cines();
    if (list.length === 0) return null;
    return list.find((c) => c.id === this.selectedCineId()) ?? list[0]!;
  });

  /** Salas del cine seleccionado, con sus horarios filtrados al día activo. */
  readonly salasDelDia = computed<SalaVM[]>(() => {
    const cine = this.selectedCine();
    if (!cine) return [];
    const dia = this.selectedDia();
    return cine.salas
      .map((s) => ({ ...s, horarios: s.horarios.filter((h) => h.dia === dia) }))
      .filter((s) => s.horarios.length > 0);
  });

  ngOnChanges(): void {
    if (this.peliculaId) this.fetch();
  }

  onDayChange(date: Date): void {
    this.selectedDia.set(diaKey(date));
  }

  selectCine(id: string): void {
    this.selectedCineId.set(id);
  }

  private fetch(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.cinesSvc.cines(this.peliculaId).subscribe({
      next: (cines) => {
        this.cines.set(cines);
        this.selectedCineId.set(this.resolveInitialCine(cines));
        this.cargando.set(false);
      },
      error: () => {
        this.cines.set([]);
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  /** Preselecciona el cine guardado en la ubicación del usuario, si está disponible. */
  private resolveInitialCine(cines: CineFuncionesVM[]): string | null {
    if (cines.length === 0) return null;
    const saved = this.location.cinemaName();
    if (saved) {
      const norm = saved.toLowerCase();
      const match = cines.find((c) => c.nombre.toLowerCase().includes(norm));
      if (match) return match.id;
    }
    return cines[0]!.id;
  }
}
