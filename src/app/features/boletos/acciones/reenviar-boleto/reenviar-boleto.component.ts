import { Component, Input, OnDestroy, inject } from '@angular/core';
import { ToastService } from '../../../../shared/services/toast.service';
import { ReenvioBoletosService } from '../../../../shared/services/reenvio-boletos.service';

interface BoletoConNumero {
  numero_reserva: string;
}

@Component({
  selector: 'app-reenviar-boleto',
  standalone: true,
  templateUrl: './reenviar-boleto.component.html',
  styleUrl: './reenviar-boleto.component.scss',
})
export class ReenviarBoletoComponent implements OnDestroy {
  @Input({ required: true }) boleto!: BoletoConNumero;

  reenviando = false;
  segundos = 0;

  private readonly toast = inject(ToastService);
  private readonly reenvio = inject(ReenvioBoletosService);
  private intervalo: ReturnType<typeof setInterval> | null = null;

  reenviar() {
    if (this.reenviando || this.segundos > 0) return;
    this.reenviando = true;
    this.reenvio.reenviarMio(this.boleto.numero_reserva).subscribe({
      next: (res) => {
        this.reenviando = false;
        if (res.ok) {
          this.toast.show('Boleto reenviado a tu correo');
          this.startCooldown(60);
        } else {
          this.toast.show(`Esperá ${res.retryAfter}s para reenviar de nuevo`);
          this.startCooldown(res.retryAfter);
        }
      },
      error: () => {
        this.reenviando = false;
        this.toast.show('No se pudo enviar el correo. Intentá en unos minutos.');
      },
    });
  }

  private startCooldown(segs: number) {
    this.segundos = segs;
    this.clearInterval();
    this.intervalo = setInterval(() => {
      this.segundos--;
      if (this.segundos <= 0) this.clearInterval();
    }, 1000);
  }

  private clearInterval() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  ngOnDestroy() {
    this.clearInterval();
  }
}
