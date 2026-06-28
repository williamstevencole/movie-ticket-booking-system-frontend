import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Boleto } from '../../../shared/services/boletos.service';
import { MisReservasService } from '../../../shared/services/mis-reservas.service';
import { PoliticasCancelacionService, PoliticaCancelacion } from '../../../shared/services/politicas-cancelacion.service';
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
  private readonly politicasSvc = inject(PoliticasCancelacionService);

  reserva: Boleto | null = null;
  readonly mostrarConfirmacion = signal(false);
  readonly politica = signal<PoliticaCancelacion | null>(null);

  readonly porcentajeEstimado = computed(() => {
    const p = this.politica();
    if (!this.reserva || !p?.reglas?.length) return 0;
    const horasAntes = (new Date(this.reserva.fecha_hora).getTime() - Date.now()) / 3_600_000;
    const regla = p.reglas.find(
      (r) =>
        r.horas_antes_minimo <= horasAntes &&
        (r.horas_antes_maximo === null || r.horas_antes_maximo > horasAntes),
    );
    return regla?.porcentaje_reembolso ?? 0;
  });

  constructor() {
    const numero = this.route.snapshot.paramMap.get('id') ?? '';
    this.misReservasSvc.getByNumero(numero).subscribe({
      next: (b) => {
        this.reserva = b;
        if (b) {
          this.politicasSvc.getPublicByCine(b.cine.id).subscribe({
            next: (politicas) => this.politica.set(politicas[0] ?? null),
          });
        }
      },
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
