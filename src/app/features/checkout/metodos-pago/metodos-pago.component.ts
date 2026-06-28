import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { EfectivoComponent } from './efectivo/efectivo.component';
import { CuponComponent } from '../cupon/cupon.component';
import { AgreementsComponent } from '../agreements/agreements.component';
import { StepperComponent } from '../stepper/stepper.component';
import { ResumenComponent } from '../resumen/resumen.component';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { LucideCreditCard, LucideBanknote } from '@lucide/angular';
import { CheckoutStateService } from '../checkout-state.service';
import {
  MetodosPagoService,
  MetodoPago,
} from '../../../shared/services/metodos-pago.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PagosService } from '../../../shared/services/pagos.service';
import { MisReservasService } from '../../../shared/services/mis-reservas.service';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [
    TarjetaComponent,
    EfectivoComponent,
    CuponComponent,
    AgreementsComponent,
    StepperComponent,
    ResumenComponent,
    AppbarComponent,
    FooterComponent,
    LucideCreditCard,
    LucideBanknote,
  ],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss',
})
export class MetodosPagoComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly checkoutStateSvc = inject(CheckoutStateService);
  private readonly metodosPagoSvc = inject(MetodosPagoService);
  private readonly auth = inject(AuthService);
  private readonly pagosSvc = inject(PagosService);
  private readonly route = inject(ActivatedRoute);
  private readonly misReservasSvc = inject(MisReservasService);

  readonly pelicula = signal('');
  readonly cine = signal('');
  readonly sala = signal('');
  readonly numeroReserva = signal('');
  readonly idReserva = signal<string | null>(null);
  readonly fechaHoraFuncion = signal<string>(new Date(Date.now() + 60 * 60 * 1000).toISOString());
  readonly asientos = signal<string[]>([]);
  readonly precioOriginal = signal(0);
  readonly descuento = signal(0);
  readonly codigoCupon = signal<string | null>(null);
  readonly politicaAceptada = signal(false);
  readonly recordatorios = signal(false);
  readonly metodoPago = signal<'tarjeta' | 'efectivo'>('tarjeta');
  readonly pagando = signal(false);
  readonly pagoError = signal<string | null>(null);

  readonly tarjetasGuardadas = signal<MetodoPago[]>([]);
  readonly tarjetaSeleccionadaId = signal<string | null>(null);
  readonly mostrarFormNueva = signal(false);

  readonly efectivoDisponible = computed(() => {
    const min = (new Date(this.fechaHoraFuncion()).getTime() - Date.now()) / 60_000;
    return min >= 30;
  });

  readonly totalFinal = computed(() => this.precioOriginal() - this.descuento());

  readonly idMetodoPagoSeleccionado = computed<string | null>(() =>
    this.metodoPago() === 'tarjeta' ? this.tarjetaSeleccionadaId() : null,
  );

  ngOnInit(): void {
    const reservaPendiente = this.checkoutStateSvc.getReservaPendiente();
    if (reservaPendiente) {
      this.idReserva.set(reservaPendiente.id_reserva);
      this.numeroReserva.set(reservaPendiente.numero_reserva);
      this.asientos.set(reservaPendiente.asientos.map((a) => a.codigo));
      this.precioOriginal.set(parseFloat(reservaPendiente.total_estimado));

      this.misReservasSvc.getByNumero(reservaPendiente.numero_reserva).subscribe((boleto) => {
        if (boleto) {
          this.pelicula.set(boleto.pelicula.titulo);
          this.cine.set(boleto.cine.nombre);
          this.sala.set(boleto.sala.nombre);
          this.fechaHoraFuncion.set(boleto.fecha_hora);
        }
      });
    } else {
      const reservaId = this.route.snapshot.queryParamMap.get('reserva');
      if (reservaId) this.idReserva.set(reservaId);
    }

    this.metodosPagoSvc.listar().subscribe((list) => {
      this.tarjetasGuardadas.set(list);
      const predeterminado = list.find((m) => m.predeterminado);
      if (predeterminado) {
        this.tarjetaSeleccionadaId.set(predeterminado.id);
        this.mostrarFormNueva.set(false);
      } else if (list.length > 0) {
        this.tarjetaSeleccionadaId.set(list[0]!.id);
        this.mostrarFormNueva.set(false);
      } else {
        this.tarjetaSeleccionadaId.set(null);
        this.mostrarFormNueva.set(true);
      }
    });
  }

  onDescuentoAplicado(monto: number): void {
    this.descuento.set(monto);
  }

  onCodigoCambio(codigo: string | null): void {
    this.codigoCupon.set(codigo);
  }

  onTarjetaGuardadaChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '__nueva__') {
      this.tarjetaSeleccionadaId.set(null);
      this.mostrarFormNueva.set(true);
    } else {
      this.tarjetaSeleccionadaId.set(value);
      this.mostrarFormNueva.set(false);
    }
  }

  pagar(): void {
    if (this.pagando()) return;
    this.pagoError.set(null);

    const base = {
      email: this.auth.user()?.email ?? '',
      numeroReserva: this.numeroReserva(),
      pelicula: this.pelicula(),
      cine: this.cine(),
      fechaHora: this.fechaHoraFuncion(),
      asientos: this.asientos(),
      total: this.totalFinal() + 15,
    };

    if (this.metodoPago() === 'efectivo') {
      this.checkoutStateSvc.setResultado({ ...base, resultado: 'exito', mensajeError: null });
      this.router.navigate(['/checkout/resultado']);
      return;
    }

    const idReserva = this.idReserva();
    if (!idReserva) {
      this.pagoError.set(
        'No se encontró la reserva. Volvé al mapa y seleccioná tus asientos de nuevo.',
      );
      return;
    }

    this.pagando.set(true);
    this.pagosSvc
      .crearTarjeta({
        id_reserva: idReserva,
        metodo: 'tarjeta',
        referencia_externa: this.idMetodoPagoSeleccionado() ?? undefined,
        codigo_cupon: this.codigoCupon() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.pagando.set(false);
          this.checkoutStateSvc.setReservaPendiente(null);
          this.checkoutStateSvc.setResultado({ ...base, resultado: 'exito', mensajeError: null });
          this.router.navigate(['/checkout/resultado']);
        },
        error: (err) => {
          this.pagando.set(false);
          const code = err?.error?.code;
          if (err?.status === 409 && code === 'RESERVA_NO_PAGABLE') {
            const msg = 'La reserva expiró o ya fue pagada. Volvé al mapa para reintentar.';
            this.pagoError.set(msg);
            this.checkoutStateSvc.setResultado({ ...base, resultado: 'error', mensajeError: msg });
            this.router.navigate(['/checkout/resultado']);
            return;
          }
          const msg =
            err?.error?.message ?? err?.message ?? 'No se pudo procesar el pago. Intenta de nuevo.';
          this.pagoError.set(msg);
          this.checkoutStateSvc.setResultado({ ...base, resultado: 'error', mensajeError: msg });
          this.router.navigate(['/checkout/resultado']);
        },
      });
  }
}
