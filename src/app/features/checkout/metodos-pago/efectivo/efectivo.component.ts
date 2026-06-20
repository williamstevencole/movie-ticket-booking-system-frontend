import { Component, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-efectivo',
  standalone: true,
  templateUrl: './efectivo.component.html',
  styleUrl: './efectivo.component.scss',
})
export class EfectivoComponent {
  constructor(
    private location: Location,
    private router: Router,
  ) {}

  continuar() {
    this.router.navigate(['/checkout/resultado']);
  }

  volver() {
    this.location.back();
  }
}
