
import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

type StepStatus = 'done' | 'current' | 'pending';

interface CheckoutStep {
  id: number;
  label: string;
  route: string;
}


@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {

  private router = inject(Router);


  readonly steps: CheckoutStep[] = [
    {
      id: 1,
      label: 'Asientos',
      route: '/sala'
    },
    {
      id: 2,
      label: 'Pago',
      route: '/checkout/metodos-pago'
    },
    {
      id: 3,
      label: 'Confirmación',
      route: '/checkout/confirmacion'
    }
  ];


  currentRoute = '';



  constructor() {

    this.currentRoute = this.router.url;


    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event:any) => {

        this.currentRoute = event.urlAfterRedirects;

      });

  }



  getStatus(step: CheckoutStep): StepStatus {

    const currentIndex = this.steps.findIndex(
      s => this.currentRoute.includes(s.route)
    );


    const stepIndex = this.steps.indexOf(step);



    if(stepIndex < currentIndex) {
      return 'done';
    }


    if(stepIndex === currentIndex) {
      return 'current';
    }


    return 'pending';

  }

}