import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-tiempo-restante',
  standalone: true,
  templateUrl: './tiempo-restante.component.html',
  styleUrl: './tiempo-restante.component.scss',
})
export class TiempoRestanteComponent implements OnInit, OnDestroy {
  @Input() fechaFuncion!: string;

  @Input() variante: 'pill' | 'banner' = 'pill';

  tiempo = signal('');

  clase = signal('');

  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.actualizar();

    // actualiza cada minuto
    this.interval = setInterval(() => {
      this.actualizar();
    }, 60000);
  }

  actualizar() {
    const ahora = new Date().getTime();

    const funcion = new Date(this.fechaFuncion).getTime();

    const diferencia = funcion - ahora;

    // ya pasó
    if (diferencia <= 0) {
      this.tiempo.set('');

      return;
    }

    const minutos = Math.floor(diferencia / (1000 * 60));

    const dias = Math.floor(minutos / 1440);

    const horas = Math.floor((minutos % 1440) / 60);

    const mins = minutos % 60;

    if (dias > 0) {
      this.tiempo.set(`En ${dias} día${dias > 1 ? 's' : ''}`);

      this.clase.set('normal');
    } else {
      this.tiempo.set(`En ${horas}h ${mins}min`);

      if (minutos < 180) {
        // menos de 3 horas
        this.clase.set('muy-urgente');
      } else {
        // menos de 24 horas
        this.clase.set('urgente');
      }
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
