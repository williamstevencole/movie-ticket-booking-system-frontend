import { Component, WritableSignal, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  readonly seguidas: WritableSignal<SuscripcionVista[]> = signal([]);

  constructor() {
    effect(() => {
      const ids = Array.from(this.suscripciones.subscritas());
      if (ids.length === 0) {
        this.seguidas.set([]);
        return;
      }
      forkJoin(ids.map((id) => this.peliculasSvc.getById(id).pipe(catchError(() => of(null))))).subscribe({
        next: (results) => {
          const vistas = (results.filter((p): p is Pelicula => p !== null))
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
          this.seguidas.set(vistas);
        },
      });
    });
  }

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
