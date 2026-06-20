import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MOCK_BOLETOS } from '../../../mocks/data/boletos.mock';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cancelar',
  standalone: true,
  imports: [CommonModule, AppbarComponent, FooterComponent],
  templateUrl: './cancelar.component.html',
  styleUrl: './cancelar.component.scss',
})
export class CancelarComponent {
  constructor(private route: ActivatedRoute, private location: Location) {}
  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  id!: string;

  reserva = MOCK_BOLETOS.find((b) => b.id === this.id);

  volver() {
    this.location.back();
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }
}
