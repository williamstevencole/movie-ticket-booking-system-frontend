import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MiReembolso as Reembolso, MisReembolsosService } from '../../../../shared/services/mis-reembolsos.service';
import { Boleto } from '../../../../shared/services/boletos.service';
import { MisReservasService } from '../../../../shared/services/mis-reservas.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private readonly reembolsosSvc = inject(MisReembolsosService);

  readonly boletos = toSignal(this.misReservasSvc.list(), { initialValue: [] as Boleto[] });
  readonly reembolsos = signal<Reembolso[]>([]);

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.reembolsosSvc.list().subscribe((list) => this.reembolsos.set(list));
  }

  boletoForReembolso(reembolso: Reembolso): Boleto | undefined {
    return this.boletos().find((b) => b.numero_reserva === reembolso.numero_reserva);
  }

  actualizarEstado() {
    this.cargar();
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
