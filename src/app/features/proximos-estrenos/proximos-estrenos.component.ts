import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PeliculasService, Pelicula } from '../../shared/services/peliculas.service';

type PeliculaProximoEstreno = Pelicula & { diasParaEstreno: number };

@Component({
  selector: 'app-proximos-estrenos',
  standalone: true,
  imports: [CommonModule, RouterLink, AppbarComponent, FooterComponent],
  templateUrl: './proximos-estrenos.component.html',
  styleUrl: './proximos-estrenos.component.scss',
})
export class ProximosEstrenosComponent {
  private readonly peliculasSvc = inject(PeliculasService);
  readonly todas = toSignal(this.peliculasSvc.list().pipe(map((res) => res.data)), { initialValue: [] as Pelicula[] });

  readonly proximos = computed<PeliculaProximoEstreno[]>(() => {
    const now = Date.now();
    const dia = 1000 * 60 * 60 * 24;
    return this.todas()
      .filter((p) => p.activo && new Date(p.fecha_estreno).getTime() > now)
      .map((p) => ({
        ...p,
        diasParaEstreno: Math.ceil((new Date(p.fecha_estreno).getTime() - now) / dia),
      }))
      .sort((a, b) => a.diasParaEstreno - b.diasParaEstreno);
  });
}
