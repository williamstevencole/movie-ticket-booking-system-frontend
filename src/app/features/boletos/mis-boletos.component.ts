import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideClock,
  LucideMapPin,
  LucideTicket,
  LucideFilm,
  LucideRotateCcw,
  LucideArrowRight,
  LucideCalendarX,
  LucideChevronRight,
} from '@lucide/angular';

import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AuthService } from '../../shared/services/auth.service';
import { Reserva, EstadoReserva, ReservasService } from '../../shared/services/reservas.service';
import { Funcion, FuncionesService } from '../../shared/services/funciones.service';
import { Pelicula, PeliculasService } from '../../shared/services/peliculas.service';
import { Cine, CinesService } from '../../shared/services/cines.service';

type TabKind = 'proximos' | 'pasados' | 'cancelados';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppbarComponent,
    FooterComponent,
    LucideClock,
    LucideMapPin,
    LucideTicket,
    LucideFilm,
    LucideRotateCcw,
    LucideArrowRight,
    LucideCalendarX,
    LucideChevronRight,
  ],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  private readonly auth = inject(AuthService);
  private readonly reservasSvc = inject(ReservasService);
  private readonly funcionesSvc = inject(FuncionesService);
  private readonly peliculasSvc = inject(PeliculasService);
  private readonly cinesSvc = inject(CinesService);
  private readonly router = inject(Router);

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  // ── Estado ────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly reservas = signal<Reserva[]>([]);
  readonly funcionesById = signal<Map<string, Funcion>>(new Map());
  readonly peliculasById = signal<Map<string, Pelicula>>(new Map());
  readonly cinesById = signal<Map<string, Cine>>(new Map());
  readonly tab = signal<TabKind>('proximos');

  // ── Computed ──────────────────────────────────────────────────
  readonly proximos = computed(() => {
    const now = new Date();
    return this.reservas().filter((r) => {
      if (r.estado !== 'pagada' && r.estado !== 'pendiente_pago') return false;
      const fecha = this.fechaFuncion(r);
      return fecha != null && fecha > now;
    });
  });

  readonly pasados = computed(() => {
    const now = new Date();
    return this.reservas().filter((r) => {
      if (r.estado !== 'pagada') return false;
      const fecha = this.fechaFuncion(r);
      return fecha != null && fecha <= now;
    });
  });

  readonly cancelados = computed(() =>
    this.reservas().filter((r) =>
      r.estado === 'cancelada' || r.estado === 'reembolsada' || r.estado === 'expirada',
    ),
  );

  readonly filtered = computed((): Reserva[] => {
    switch (this.tab()) {
      case 'proximos':
        return this.proximos();
      case 'pasados':
        return this.pasados();
      case 'cancelados':
        return this.cancelados();
    }
  });

  readonly counts = computed(() => ({
    proximos: this.proximos().length,
    pasados: this.pasados().length,
    cancelados: this.cancelados().length,
  }));

  // ── Constructor / carga ───────────────────────────────────────
  constructor() {
    let loaded = 0;
    const tryDone = () => {
      loaded++;
      if (loaded >= 4) this.cargando.set(false);
    };

    this.reservasSvc.list().subscribe((all) => {
      const userId = this.auth.user()?.id;
      let mine = userId ? all.filter((r) => r.id_usuario === userId) : [];
      // MOCK FALLBACK: si el usuario logueado no tiene reservas en los mocks
      // (los mocks usan u-1…u-12 y el usuario real tiene otro id), mostramos todas.
      if (mine.length === 0) mine = all;
      this.reservas.set(mine);
      tryDone();
    });

    this.funcionesSvc.list().subscribe((all) => {
      const map = new Map<string, Funcion>();
      for (const f of all) map.set(f.id, f);
      this.funcionesById.set(map);
      tryDone();
    });

    this.peliculasSvc.list().subscribe((all) => {
      const map = new Map<string, Pelicula>();
      for (const p of all) map.set(p.id, p);
      this.peliculasById.set(map);
      tryDone();
    });

    this.cinesSvc.list().subscribe((page) => {
      const map = new Map<string, Cine>();
      for (const c of page.data) map.set(c.id, c);
      this.cinesById.set(map);
      tryDone();
    });
  }

  // ── Helpers de datos ──────────────────────────────────────────
  peliculaDe(r: Reserva): Pelicula | null {
    const funcion = this.funcionesById().get(r.id_funcion);
    if (!funcion) return null;
    return this.peliculasById().get(funcion.id_pelicula) ?? null;
  }

  cineDe(r: Reserva): Cine | null {
    const funcion = this.funcionesById().get(r.id_funcion);
    if (!funcion) return null;
    return this.cinesById().get(funcion.id_cine) ?? null;
  }

  salaDe(r: Reserva): string {
    const funcion = this.funcionesById().get(r.id_funcion);
    if (!funcion) return '—';
    const cine = this.cinesById().get(funcion.id_cine);
    if (!cine) return '—';
    const sala = cine.salas.find((s) => s.id === funcion.id_sala);
    return sala?.nombre ?? '—';
  }

  fechaFuncion(r: Reserva): Date | null {
    const funcion = this.funcionesById().get(r.id_funcion);
    if (!funcion) return null;
    return new Date(funcion.fecha_inicio);
  }

  fechaFuncionTexto(r: Reserva): string {
    const fecha = this.fechaFuncion(r);
    if (!fecha) return '—';
    return fecha.toLocaleString('es-HN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  tiempoRestanteTexto(r: Reserva): string {
    const fecha = this.fechaFuncion(r);
    if (!fecha) return '—';
    const diffMs = fecha.getTime() - Date.now();
    const absMs = Math.abs(diffMs);
    const mins = Math.floor(absMs / 60_000);
    const hours = Math.floor(absMs / 3_600_000);
    const days = Math.floor(absMs / 86_400_000);
    const prefix = diffMs < 0 ? 'Hace ' : 'En ';

    if (days === 0 && diffMs >= 0) {
      if (hours === 0) return `En ${mins}min`;
      return `En ${hours}h ${mins % 60}min`;
    }
    if (days === 0 && diffMs < 0) return 'Hoy';
    if (days === 1 && diffMs < 0) return 'Ayer';
    return `${prefix}${days} ${days === 1 ? 'día' : 'días'}`;
  }

  tiempoRestanteKind(r: Reserva): 'urgente' | 'normal' | 'pasado' {
    const fecha = this.fechaFuncion(r);
    if (!fecha) return 'normal';
    const diffMs = fecha.getTime() - Date.now();
    if (diffMs < 0) return 'pasado';
    if (diffMs < 24 * 3_600_000) return 'urgente';
    return 'normal';
  }

  showQr(r: Reserva): boolean {
    const fecha = this.fechaFuncion(r);
    return r.estado === 'pagada' && fecha != null && fecha > new Date();
  }

  estadoLabel(estado: EstadoReserva | string): string {
    const map: Record<string, string> = {
      cancelada: 'Cancelada',
      reembolsada: 'Reembolsada',
      expirada: 'Expirada',
    };
    return map[estado] ?? estado;
  }

  setTab(t: TabKind): void {
    this.tab.set(t);
  }

  verDetalle(r: Reserva): void {
    this.router.navigate(['/mis-boletos', r.numero_reserva]);
  }

  // ── QR placeholder determinístico ────────────────────────────
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
          cells.push({ x: x * 3, y: y * 3 });
        }
      }
    }
    return cells;
  }
}
