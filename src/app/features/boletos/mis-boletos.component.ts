import { Component } from '@angular/core';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MOCK_BOLETOS } from '../../mocks/data/boletos.mock';
import { PoliticasComponent } from '../cancelacion/politicas/politicas.component';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [AppbarComponent, FooterComponent, PoliticasComponent],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  mostrarPoliticas = false;

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  readonly boletos = MOCK_BOLETOS;

  abrirPoliticas() {
    this.mostrarPoliticas = true;
  }

  cerrarPoliticas() {
    this.mostrarPoliticas = false;
  }
}
