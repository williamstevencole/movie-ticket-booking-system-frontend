import { Component } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MOCK_REEMBOLSOS } from '../../../mocks/data/reembolsos.mock';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reembolsos',
  standalone: true,
  imports: [AppbarComponent, FooterComponent, DatePipe, UpperCasePipe],
  templateUrl: './reembolsos.component.html',
  styleUrl: './reembolsos.component.scss',
})
export class ReembolsosComponent {
  constructor(private router: Router) {}

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  reembolso = MOCK_REEMBOLSOS[0];

  volverBoletos() {
    this.router.navigate(['/mis-boletos']);
  }
}
