import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { AuthService } from '../../../shared/services/auth.service';
import { CarteleraService } from '../../../shared/services/cartelera.service';
import { LocationService } from '../../../shared/services/location.service';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PosterBadgeComponent } from '../../../shared/components/poster-badge/poster-badge.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';
import { HeroCarouselComponent } from '../hero-carousel/hero-carousel.component';
import { DayStripComponent } from '../day-strip/day-strip.component';
import { PromosComponent } from '../promos/promos.component';
import { ProximamenteComponent } from '../proximamente/proximamente.component';
import { CarteleraPelicula } from '../../../mocks/data/cartelera-display.mock';

const MN = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-cartelera-home',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    AppbarComponent,
    FooterComponent,
    PosterBadgeComponent,
    RatingDisplayComponent,
    HeroCarouselComponent,
    DayStripComponent,
    PromosComponent,
    ProximamenteComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class CarteleraHomeComponent implements OnInit {
  private auth = inject(AuthService);
  private cartelera = inject(CarteleraService);
  private location = inject(LocationService);

  readonly nav = [
    { label: 'Cartelera', route: '/', active: true },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Promociones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos' },
  ];

  readonly peliculas = signal<CarteleraPelicula[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly fechaActiva = signal(this.formatDateLabel(new Date()));

  ngOnInit(): void {
    const ciudadId = this.location.selection()?.cityId;
    this.cartelera.listar({ ciudad_id: ciudadId || undefined, limit: 24 }).subscribe({
      next: (list) => {
        this.peliculas.set(list);
        this.cargando.set(false);
      },
      error: () => {
        this.peliculas.set([]);
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  userName(): string {
    return this.auth.user()?.nombre?.split(' ')[0] ?? 'invitado';
  }

  onDayChange(date: Date): void {
    this.fechaActiva.set(this.formatDateLabel(date));
  }

  filtered(): CarteleraPelicula[] {
    return this.peliculas();
  }

  private formatDateLabel(d: Date): string {
    return `${WD[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MN[d.getMonth()]}`;
  }
}
