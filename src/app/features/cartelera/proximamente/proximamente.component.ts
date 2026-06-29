import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck } from '@lucide/angular';
import { ProximoEstreno } from '../../../mocks/data/cartelera-display.mock';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SuscripcionesEstrenoService } from '../../../shared/services/suscripciones-estreno.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [LucideArrowRight, LucideCheck, PosterBadgeComponent, RouterLink],
  templateUrl: './proximamente.component.html',
  styleUrl: './proximamente.component.scss',
})
export class ProximamenteComponent implements OnInit {
  private toast = inject(ToastService);
  private cartelera = inject(CarteleraService);
  private location = inject(LocationService);
  private suscripciones = inject(SuscripcionesEstrenoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly peliculas = signal<ProximoEstreno[]>([]);
  readonly pending = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const ciudadId = this.location.selection()?.cityId;
    this.cartelera.proximos({ ciudad_id: ciudadId || undefined }).subscribe({
      next: (list) => this.peliculas.set(list),
      error: () => this.peliculas.set([]),
    });
  }

  isSubscribed(id: string): boolean {
    return this.suscripciones.estaSuscrito(id);
  }

  isPending(id: string): boolean {
    return this.pending().has(id);
  }

  toggleNotify(id: string): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.show('Iniciá sesión para que te avisemos');
      this.router.navigate(['/login'], { queryParams: { redirect: '/cartelera' } });
      return;
    }
    if (this.isPending(id)) return;

    const pendingSet = new Set(this.pending());
    pendingSet.add(id);
    this.pending.set(pendingSet);

    const wasSubscribed = this.isSubscribed(id);
    const op = wasSubscribed ? this.suscripciones.unsubscribe(id) : this.suscripciones.subscribe(id);
    op.subscribe({
      next: () => {
        this.toast.show(wasSubscribed
          ? 'Quitamos el aviso'
          : 'Te avisaremos cuando se estrene');
        this.removePending(id);
      },
      error: () => {
        this.toast.show('No pudimos guardar tu suscripción');
        this.removePending(id);
      },
    });
  }

  private removePending(id: string) {
    const next = new Set(this.pending());
    next.delete(id);
    this.pending.set(next);
  }
}
