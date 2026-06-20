import { Component } from '@angular/core';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { BoletoMock, MOCK_BOLETOS } from '../../mocks/data/boletos.mock';
import { PoliticasComponent } from '../cancelacion/politicas/politicas.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [AppbarComponent, FooterComponent, PoliticasComponent, RouterLink],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  vistaActual: 'activos' | 'historial' | 'reembolsos' = 'activos';

  boletos = MOCK_BOLETOS;

  mostrarPoliticas = false;

  selectedBoleto?: BoletoMock;

  //para probar con diferente ESTADO
  reembolsos = [
    {
      id: 'RES-00001',
      pelicula: 'Spider-Man: Across the Spider-Verse',
      monto: 240,
      estado: 'PROCESADO',
      fecha: '20 Junio 2026',
    },
  ];

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  abrirPoliticas(boleto: BoletoMock) {
    this.selectedBoleto = boleto;
    this.mostrarPoliticas = true;
  }

  cerrarPoliticas() {
    this.mostrarPoliticas = false;
  }

  cambiarVista(vista: 'activos' | 'historial' | 'reembolsos') {
    this.vistaActual = vista;
  }
}
