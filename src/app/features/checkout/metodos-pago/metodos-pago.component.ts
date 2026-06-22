import { Component, computed, inject, signal } from '@angular/core';
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
export class MetodosPagoComponent {
  private readonly router = inject(Router);

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

  readonly efectivoDisponible = computed(() => {
    const min = (new Date(this.fechaHoraFuncion).getTime() - Date.now()) / 60_000;
    return min >= 30;
  });

  readonly totalFinal = computed(() => this.precioOriginal() - this.descuento());

  onDescuentoAplicado(monto: number) { this.descuento.set(monto); }

  pagar() {
    this.router.navigate(['/checkout/resultado']);
  }
}
