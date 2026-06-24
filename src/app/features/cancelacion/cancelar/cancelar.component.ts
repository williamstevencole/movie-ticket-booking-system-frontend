import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Boleto } from '../../../shared/services/boletos.service';
import { MisReservasService } from '../../../shared/services/mis-reservas.service';
import { PoliticasComponent } from '../politicas/politicas.component';
import { PoliticasCardComponent } from '../politicas-card/politicas-card.component';
import { TiempoRestanteComponent } from '../../boletos/mis-boletos/tiempo-restante/tiempo-restante.component';
import { RefundSideComponent } from '../refund-side/refund-side.component';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-cancelar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PoliticasComponent,
    PoliticasCardComponent,
    TiempoRestanteComponent,
    RefundSideComponent,
    AppbarComponent,
    FooterComponent,
  ],
  templateUrl: './cancelar.component.html',
  styleUrl: './cancelar.component.scss',
})
export class CancelarComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly misReservasSvc = inject(MisReservasService);

  reserva: Boleto | null = null;
  readonly mostrarConfirmacion = signal(false);

  readonly porcentajeEstimado = computed(() => {
    if (!this.reserva) return 0;
    const horasAntes = (new Date(this.reserva.fecha_hora).getTime() - Date.now()) / (60 * 60 * 1000);
    if (horasAntes > 24) return 100;
    if (horasAntes >= 12) return 50;
    return 0;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.misReservasSvc.getByNumero(id).subscribe({
      next: (b) => { this.reserva = b ?? null; },
      error: () => { this.reserva = null; },
    });
  }

  asientosCodigos(boleto: Boleto): string {
    return boleto.asientos.map((a) => a.codigo).join(', ');
  }

  confirmar(): void {
    this.mostrarConfirmacion.set(true);
  }
}
