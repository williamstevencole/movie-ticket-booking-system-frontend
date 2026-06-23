import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { LucideCheck, LucideX } from '@lucide/angular';
import { AuthService } from '../../../shared/services/auth.service';
import { CheckoutStateService, CheckoutResultado } from '../checkout-state.service';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, RouterLink, AppbarComponent, FooterComponent, LucideCheck, LucideX],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.scss',
})
export class ResultadoComponent implements OnInit {
  private readonly checkoutState = inject(CheckoutStateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly data = signal<CheckoutResultado>({
    resultado: 'exito',
    email: this.auth.user()?.email ?? '',
    numeroReserva: '—',
    pelicula: '—',
    cine: '—',
    fechaHora: new Date().toISOString(),
    asientos: [],
    total: 0,
    mensajeError: null,
  });

  ngOnInit(): void {
    const r = this.checkoutState.consumeResultado();
    if (r) {
      this.data.set(r);
    } else {
      this.router.navigate(['/']);
    }
  }
}
