import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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

  readonly pelicula = signal('Spider-Man: Across the Spider-Verse');
  readonly cine = signal('Cinetario Mall');
  readonly sala = signal('Sala 4');
  readonly numeroReserva = signal('#CT-48291');
  /** The real reservation UUID used for POST /api/pagos */
  readonly idReserva = signal<string | null>(null);
  readonly fechaHoraFuncion = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  readonly asientos = signal<string[]>(['A3', 'A4']);
  readonly precioOriginal = signal(200);
  readonly descuento = signal(0);
  readonly codigoCupon = signal<string | null>(null);
  readonly politicaAceptada = signal(false);
  readonly recordatorios = signal(false);
  readonly metodoPago = signal<'tarjeta' | 'efectivo'>('tarjeta');
  readonly pagando = signal(false);
  readonly pagoError = signal<string | null>(null);

  // Saved payment methods
  readonly tarjetasGuardadas = signal<MetodoPago[]>([]);
  /** null = add new, string = id of saved method */
  readonly tarjetaSeleccionadaId = signal<string | null>(null);
  readonly mostrarFormNueva = signal(false);

  readonly efectivoDisponible = computed(() => {
    const min = (new Date(this.fechaHoraFuncion).getTime() - Date.now()) / 60_000;
    return min >= 30;
  });

  readonly totalFinal = computed(() => this.precioOriginal() - this.descuento());

  /** The id_metodo_pago to include in the pago payload */
  readonly idMetodoPagoSeleccionado = computed<string | null>(() =>
    this.metodoPago() === 'tarjeta' ? this.tarjetaSeleccionadaId() : null,
  );

  ngOnInit(): void {
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

  onDescuentoAplicado(monto: number) {
    this.descuento.set(monto);
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
    this.pagoError.set(null);

    if (this.metodoPago() === 'efectivo') {
      // Efectivo is admin-only via API. For cliente self-service: show result as "pending taquilla".
      this.checkoutStateSvc.setResultado({
        resultado: 'exito',
        email: this.auth.user()?.email ?? '',
        numeroReserva: this.numeroReserva(),
        pelicula: this.pelicula(),
        cine: this.cine(),
        fechaHora: this.fechaHoraFuncion,
        asientos: this.asientos(),
        total: this.totalFinal() + 15,
        mensajeError: null,
      });
      this.router.navigate(['/checkout/resultado']);
      return;
    }

    // Tarjeta flow: POST /api/pagos
    const idReserva = this.idReserva();
    if (!idReserva) {
      // No real reservation id available (e.g. UI not yet fully wired to booking flow)
      // Fall through to success screen with existing state
      this.checkoutStateSvc.setResultado({
        resultado: 'exito',
        email: this.auth.user()?.email ?? '',
        numeroReserva: this.numeroReserva(),
        pelicula: this.pelicula(),
        cine: this.cine(),
        fechaHora: this.fechaHoraFuncion,
        asientos: this.asientos(),
        total: this.totalFinal() + 15,
        mensajeError: null,
      });
      this.router.navigate(['/checkout/resultado']);
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
        next: (_pago) => {
          this.pagando.set(false);
          this.checkoutStateSvc.setResultado({
            resultado: 'exito',
            email: this.auth.user()?.email ?? '',
            numeroReserva: this.numeroReserva(),
            pelicula: this.pelicula(),
            cine: this.cine(),
            fechaHora: this.fechaHoraFuncion,
            asientos: this.asientos(),
            total: this.totalFinal() + 15,
            mensajeError: null,
          });
          this.router.navigate(['/checkout/resultado']);
        },
        error: (err) => {
          this.pagando.set(false);
          const msg =
            err?.error?.message ?? err?.message ?? 'No se pudo procesar el pago. Intenta de nuevo.';
          this.pagoError.set(msg);
          this.checkoutStateSvc.setResultado({
            resultado: 'error',
            email: this.auth.user()?.email ?? '',
            numeroReserva: this.numeroReserva(),
            pelicula: this.pelicula(),
            cine: this.cine(),
            fechaHora: this.fechaHoraFuncion,
            asientos: this.asientos(),
            total: this.totalFinal() + 15,
            mensajeError: msg,
          });
          this.router.navigate(['/checkout/resultado']);
        },
      });
  }
}
