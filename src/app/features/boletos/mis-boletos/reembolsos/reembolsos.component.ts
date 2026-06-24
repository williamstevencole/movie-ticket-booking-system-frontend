import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MiReembolso as Reembolso, MisReembolsosService } from '../../../../shared/services/mis-reembolsos.service';
import { Boleto } from '../../../../shared/services/boletos.service';
import { MisReservasService } from '../../../../shared/services/mis-reservas.service';
import { PagosService, Pago } from '../../../../shared/services/pagos.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-reembolsos',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reembolsos.component.html',
  styleUrl: './reembolsos.component.scss',
})
export class ReembolsosComponent {
  private readonly router = inject(Router);
  private readonly misReservasSvc = inject(MisReservasService);
  private readonly pagosSvc = inject(PagosService);
  private readonly reembolsosSvc = inject(MisReembolsosService);

  readonly boletos = toSignal(this.misReservasSvc.list(), { initialValue: [] as Boleto[] });
  readonly pagos = toSignal(this.pagosSvc.list().pipe(map((res) => res.data)), { initialValue: [] as Pago[] });

  //agregue un mock solo para probar lo de pendiente y mas de 5 dias
  readonly reembolsos = signal<Reembolso[]>([]);

  constructor() {
    this.reembolsosSvc.list().subscribe((list) => {
      this.reembolsos.set([
        ...list,
        {
          id: 'rb-pendiente-001',
          id_pago: '999',
          id_politica: '1',
          porcentaje_aplicado: 100,
          monto: 350,
          estado: 'pendiente',
          fecha_procesado: null,
          created_at: '2026-06-10T10:00:00.000Z',
        },
      ]);
    });
  }

  boletoForReembolso(reembolso: Reembolso): Boleto | undefined {
    const pago = this.pagos().find((p) => p.id === reembolso.id_pago);
    if (!pago) return undefined;
    return this.boletos().find((b) => b.id === pago.id_reserva);
  }

  actualizarEstado() {
    console.log('Consultando estado del reembolso...');

    // mock de refresh
    this.reembolsos.update((list) =>
      list.map((r) => ({
        ...r,
        estado: r.estado === 'pendiente' ? 'procesado' : r.estado,
      }))
    );
  }

  superaCincoDias(fecha: string): boolean {
    const fechaSolicitud = new Date(fecha);

    const ahora = new Date();

    const diferencia = ahora.getTime() - fechaSolicitud.getTime();

    const dias = diferencia / (1000 * 60 * 60 * 24);

    return dias > 5;
  }

  volverBoletos() {
    this.router.navigate(['/mis-boletos']);
  }
}
