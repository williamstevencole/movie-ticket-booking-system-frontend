import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [],
  templateUrl: './tarjeta.component.html',
  styleUrl: './tarjeta.component.scss',
})
export class TarjetaComponent {
  constructor(
    private location: Location,
    private router: Router,
  ) {}
  readonly tarjeta = signal('');

  readonly expiracion = signal('');

  readonly cvv = signal('');

  recordatorioCorreo = false;

  mostrarPolitica = false;

  readonly errores = signal({
    tarjeta: '',
    expiracion: '',
    cvv: '',
  });

  abrirConfirmacion() {
    if (this.validarPago()) {
      this.mostrarPolitica = true;
    }
  }

  validarPago(): boolean {
    const nuevosErrores = {
      tarjeta: '',
      expiracion: '',
      cvv: '',
    };

    if (this.tarjeta().length !== 16) {
      nuevosErrores.tarjeta = 'El número de tarjeta debe tener 16 dígitos';
    }

    if (!/^\d{2}\/\d{2}$/.test(this.expiracion())) {
      nuevosErrores.expiracion = 'Formato inválido. Usa MM/AA';
    }

    if (this.cvv().length !== 3) {
      nuevosErrores.cvv = 'El CVV debe tener 3 dígitos';
    }

    this.errores.set(nuevosErrores);

    return !Object.values(nuevosErrores).some((error) => error !== '');
  }

  pagar() {
    this.router.navigate(['/checkout/resultado']);
  }

  actualizarTarjeta(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    // máximo 16 dígitos
    value = value.slice(0, 16);

    // formato 1234 5678 9012 3456
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    input.value = formatted;

    // guardamos solo números para validar
    this.tarjeta.set(value);
  }

  actualizarExpiracion(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    input.value = value;

    this.expiracion.set(value);
  }

  actualizarCvv(event: Event) {
    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/\D/g, '');

    input.value = value;

    this.cvv.set(value);
  }

  volver() {
    this.location.back();
  }
}
