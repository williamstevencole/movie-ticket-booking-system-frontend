import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reenviar-boleto',
  standalone: true,
  templateUrl: './reenviar-boleto.component.html',
  styleUrl: './reenviar-boleto.component.scss',
})
export class ReenviarBoletoComponent {
  @Input() boleto: any;

  reenviando = false;

  segundos = 0;

  reenviar() {
    if (this.reenviando) return;

    this.reenviando = true;

    this.segundos = 60;

    // simulación del envío
    console.log('Reenviando boleto:', this.boleto.id);

    // aquí después iría el servicio real

    const intervalo = setInterval(() => {
      this.segundos--;

      if (this.segundos === 0) {
        clearInterval(intervalo);

        this.reenviando = false;
      }
    }, 1000);

    // toast temporal
    alert('Boleto reenviado a tu correo');
  }
}
