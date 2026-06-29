import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LucideCheck } from '@lucide/angular';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PeliculasService, Pelicula } from '../../shared/services/peliculas.service';
import { SuscripcionesEstrenoService } from '../../shared/services/suscripciones-estreno.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

type PeliculaProximoEstreno = Pelicula & { diasParaEstreno: number };

@Component({
  selector: 'app-proximos-estrenos',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCheck, AppbarComponent, FooterComponent],
  templateUrl: './proximos-estrenos.component.html',
  styleUrl: './proximos-estrenos.component.scss',
})
export class ProximosEstrenosComponent {
  private readonly peliculasSvc = inject(PeliculasService);
  private readonly suscripciones = inject(SuscripcionesEstrenoService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly pending = signal<Set<string>>(new Set());

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

  readonly totalSeguidos = this.suscripciones.totalSeguidas;

  isSubscribed(id: string): boolean {
    return this.suscripciones.estaSuscrito(id);
  }

  isPending(id: string): boolean {
    return this.pending().has(id);
  }

  toggleNotify(id: string): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.show('Iniciá sesión para que te avisemos');
      this.router.navigate(['/login'], { queryParams: { redirect: '/proximos-estrenos' } });
      return;
    }
    if (this.isPending(id)) return;
    const pendingSet = new Set(this.pending());
    pendingSet.add(id);
    this.pending.set(pendingSet);
    const sub = this.isSubscribed(id);
    const op = sub ? this.suscripciones.unsubscribe(id) : this.suscripciones.subscribe(id);
    op.subscribe({
      next: () => {
        this.toast.show(sub ? 'Quitamos el aviso' : 'Te avisaremos cuando se estrene');
        this.removePending(id);
      },
      error: () => {
        this.toast.show('No pudimos guardar tu suscripción');
        this.removePending(id);
      },
    });
  }

  private removePending(id: string): void {
    const next = new Set(this.pending());
    next.delete(id);
    this.pending.set(next);
  }
}
