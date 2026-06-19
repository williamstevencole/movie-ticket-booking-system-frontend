import { Component, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnDestroy {

  private interval?: ReturnType<typeof setInterval>;

  readonly minutos = signal(10);
  readonly segundos = signal(0);


  constructor() {

    this.interval = setInterval(() => {

      this.tick();

    }, 1000);

  }



  private tick() {

    if (
      this.minutos() === 0 &&
      this.segundos() === 0
    ) {
      return;
    }


    if (this.segundos() === 0) {

      this.minutos.update(value => value - 1);

      this.segundos.set(59);

    } else {

      this.segundos.update(value => value - 1);

    }

  }



  ngOnDestroy() {

    clearInterval(this.interval);

  }



  formato(valor:number) {

    return valor
      .toString()
      .padStart(2,'0');

  }

}