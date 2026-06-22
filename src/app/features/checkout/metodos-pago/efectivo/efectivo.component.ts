import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AgreementsComponent } from '../../agreements/agreements.component';

@Component({
  selector: 'app-efectivo',
  standalone: true,
  imports: [AgreementsComponent],
  templateUrl: './efectivo.component.html',
  styleUrl: './efectivo.component.scss',
})
export class EfectivoComponent {
  constructor(
    private location: Location,
    private router: Router,
  ) {}

  recordatorioCorreo = false;

  mostrarPolitica = false;

  readonly minutosRestantes = signal(45);

  get puedePagarTaquilla() {
    return this.minutosRestantes() > 30;
  }

  continuar() {
    if (!this.puedePagarTaquilla) {
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
