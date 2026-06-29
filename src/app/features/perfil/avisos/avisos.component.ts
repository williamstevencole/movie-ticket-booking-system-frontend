import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SuscripcionesEstrenoService } from '../../../shared/services/suscripciones-estreno.service';
import { PeliculasService, Pelicula } from '../../../shared/services/peliculas.service';
import { ToastService } from '../../../shared/services/toast.service';

interface SuscripcionVista {
  id: string;
  titulo: string;
  poster_url: string | null;
  fecha_estreno: string | null;
  relativa: string;
  yaEstrenada: boolean;
}

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.scss',
})
export class AvisosComponent {
  private readonly suscripciones = inject(SuscripcionesEstrenoService);
  private readonly peliculasSvc = inject(PeliculasService);
  private readonly toast = inject(ToastService);

  private readonly catalogo = toSignal(this.peliculasSvc.list({ limit: 200 }), {
    initialValue: { data: [] as Pelicula[], total: 0, page: 1, limit: 200 },
  });

  readonly seguidas = computed<SuscripcionVista[]>(() => {
    const ids = this.suscripciones.subscritas();
    const todas: Pelicula[] = this.catalogo().data;
    return todas
      .filter((p) => ids.has(p.id))
      .map((p) => {
        const ts = p.fecha_estreno ? new Date(p.fecha_estreno).getTime() : null;
        const ya = ts !== null && ts <= Date.now();
        return {
          id: p.id,
          titulo: p.titulo,
          poster_url: p.poster_url,
          fecha_estreno: p.fecha_estreno ?? null,
          relativa: this.relativa(ts),
          yaEstrenada: ya,
        };
      })
      .sort((a, b) => (a.fecha_estreno ?? '').localeCompare(b.fecha_estreno ?? ''));
  });

  quitar(id: string) {
    this.suscripciones.unsubscribe(id).subscribe({
      next: () => this.toast.show('Aviso quitado'),
      error: () => this.toast.show('No pudimos quitar el aviso'),
    });
  }

  private relativa(ts: number | null): string {
    if (ts == null) return 'Fecha por anunciar';
    const dia = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((ts - Date.now()) / dia);
    if (diff <= 0) return 'Ya estrenada';
    if (diff === 1) return 'Mañana';
    if (diff < 8) return `En ${diff} días`;
    return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(ts));
  }
}
