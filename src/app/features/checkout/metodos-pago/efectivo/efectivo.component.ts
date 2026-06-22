import { Component, computed, Input, OnDestroy, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { LucideBanknote } from '@lucide/angular';

@Component({
  selector: 'app-efectivo',
  standalone: true,
  imports: [LucideBanknote],
  templateUrl: './efectivo.component.html',
  styleUrl: './efectivo.component.scss',
})
export class EfectivoComponent implements OnDestroy {
  @Input({ required: true }) fechaHora!: string;

  constructor(
    private location: Location,
    private router: Router,
  ) {}

  recordatorioCorreo = false;

  mostrarPolitica = false;

  // Tick para refrescar cada minuto si la página queda abierta.
  private readonly now = signal(Date.now());
  private readonly tickHandle = setInterval(() => this.now.set(Date.now()), 60_000);

  readonly minutosRestantes = computed(() => {
    const diff = new Date(this.fechaHora).getTime() - this.now();
    return Math.floor(diff / 60_000);
  });

  readonly puedeUsar = computed(() => this.minutosRestantes() >= 30);

  get puedePagarTaquilla() {
    return this.puedeUsar();
  }

  ngOnDestroy(): void {
    clearInterval(this.tickHandle);
  }

  continuar() {
    if (!this.puedeUsar()) {
      return;
    }

    this.router.navigate(['/checkout/resultado'], {
      state: {
        metodo: 'efectivo',
        estado: 'pendiente pago taquilla',
      },
    });
  }

  volver() {
    this.location.back();
  }

  abrirConfirmacion() {
    this.mostrarPolitica = true;
  }

  reservar() {
    this.router.navigate(['/checkout/resultado']);
  }
}
