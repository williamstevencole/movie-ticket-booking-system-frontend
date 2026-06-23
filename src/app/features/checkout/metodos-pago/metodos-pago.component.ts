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

  readonly pelicula = signal('Spider-Man: Across the Spider-Verse');
  readonly cine = signal('Cinetario Mall');
  readonly sala = signal('Sala 4');
  readonly numeroReserva = signal('#CT-48291');
  readonly fechaHoraFuncion = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  readonly asientos = signal<string[]>(['A3', 'A4']);
  readonly precioOriginal = signal(200);
  readonly descuento = signal(0);
  readonly politicaAceptada = signal(false);
  readonly recordatorios = signal(false);
  readonly metodoPago = signal<'tarjeta' | 'efectivo'>('tarjeta');

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

  onDescuentoAplicado(monto: number) { this.descuento.set(monto); }

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

  pagar() {
    const payload = {
      id_metodo_pago: this.idMetodoPagoSeleccionado(),
    };
    console.log('[checkout] pago payload', payload);

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
  }

  /**
   * Example: Demonstrates how to confirm a reservation with version handling.
   * In real implementation, this would be called after payment processing.
   * The CheckoutStateService handles 409 Conflict by showing toast + returning error.
   * Caller would then refresh seat map and return to mapa component.
   *
   * Usage:
   *   const funcionId = '...';
   *   const selectedSeats: Asiento[] = [...];
   *   this.confirmarReservaConConflictHandler(funcionId, selectedSeats);
   */
  confirmarReservaConConflictHandler(funcionId: string, asientosSeleccionados: any[]): void {
    this.checkoutStateSvc
      .confirmarReserva(funcionId, asientosSeleccionados)
      .subscribe({
        next: (reserva) => {
          console.log('Reserva confirmada:', reserva);
          this.router.navigate(['/checkout/resultado']);
        },
        error: (error) => {
          // CheckoutStateService already showed toast for 409
          if (error.code === 'SEAT_CONFLICT') {
            console.warn('TODO: refresh seat map and return to mapa');
            // In real implementation:
            // this.router.navigate(['/asientos', funcionId]);
          }
        },
      });
  }
}
