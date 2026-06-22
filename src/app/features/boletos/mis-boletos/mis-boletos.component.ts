import { Component } from '@angular/core';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { BoletoMock, MOCK_BOLETOS } from '../../../mocks/data/boletos.mock';
import { PoliticasComponent } from '../../cancelacion/politicas/politicas.component';
import { ReenviarBoletoComponent } from '../acciones/reenviar-boleto/reenviar-boleto.component';
import { DescargarBoletoComponent } from '../acciones/descargar-boleto/descargar-boleto.component';
import { QrBoletoComponent } from './qr/qr.component';
import { HistorialComponent } from './historial/historial.component';
import { ReembolsosComponent } from './reembolsos/reembolsos.component';
import { Router } from '@angular/router';
import { TiempoRestanteComponent } from './tiempo-restante/tiempo-restante.component';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [
    AppbarComponent,
    FooterComponent,
    PoliticasComponent,
    ReenviarBoletoComponent,
    DescargarBoletoComponent,
    QrBoletoComponent,
    HistorialComponent,
    ReembolsosComponent,
    TiempoRestanteComponent
  ],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  constructor(private router: Router) {}
  vistaActual: 'activos' | 'historial' | 'reembolsos' = 'activos';

  boletos = MOCK_BOLETOS;

  mostrarPoliticas = false;

  selectedBoleto?: BoletoMock;

  irCartelera() {
    this.router.navigate(['/']);
  }

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

  filtroBoletos: 'proximos' | 'pasados' | 'cancelados' = 'proximos';

  cambiarFiltro(filtro: 'proximos' | 'pasados' | 'cancelados') {
    this.filtroBoletos = filtro;
  }

  get proximos() {
    return this.boletos.filter((b) => b.estado === 'CONFIRMADO');
  }

  get pasados() {
    return this.boletos.filter((b) => b.estado === 'FINALIZADO');
  }

  get cancelados() {
    return this.boletos.filter((b) => b.estado === 'CANCELADO');
  }

  boletosFiltrados() {
    switch (this.filtroBoletos) {
      case 'proximos':
        return this.proximos;

      case 'pasados':
        return this.pasados;

      case 'cancelados':
        return this.cancelados;
    }
  }

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

  puedeReenviar(boleto: any): boolean {
    const estaPagado = boleto.estado === 'Pagado';

    const fechaFuncion = new Date(`${boleto.fecha} ${boleto.hora}`);
    const esFutura = fechaFuncion > new Date();

    return estaPagado && esFutura;
  }
}
