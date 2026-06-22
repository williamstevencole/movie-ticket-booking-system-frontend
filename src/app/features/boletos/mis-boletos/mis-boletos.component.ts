import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PoliticasComponent } from '../../cancelacion/politicas/politicas.component';
import { ReenviarBoletoComponent } from '../acciones/reenviar-boleto/reenviar-boleto.component';
import { DescargarBoletoComponent } from '../acciones/descargar-boleto/descargar-boleto.component';
import { QrBoletoComponent } from './qr/qr.component';
import { HistorialComponent } from './historial/historial.component';
import { ReembolsosComponent } from './reembolsos/reembolsos.component';
import { TiempoRestanteComponent } from './tiempo-restante/tiempo-restante.component';

import { Boleto, BoletosService } from '../../../shared/services/boletos.service';

type Filtro = 'proximos' | 'pasados' | 'cancelados';
type Vista = 'activos' | 'historial' | 'reembolsos';

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
    TiempoRestanteComponent,
    DatePipe,
  ],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  private readonly router = inject(Router);
  private readonly boletosSvc = inject(BoletosService);

  readonly boletos = toSignal(this.boletosSvc.list(), { initialValue: [] as Boleto[] });

  readonly vistaActual = signal<Vista>('activos');
  readonly filtroBoletos = signal<Filtro>('proximos');
  readonly mostrarPoliticas = signal(false);
  readonly selectedBoleto = signal<Boleto | null>(null);

  readonly proximos = computed(() =>
    this.boletos().filter((b) => {
      if (b.estado !== 'pagada' && b.estado !== 'pendiente_pago') return false;
      return new Date(b.fecha_hora).getTime() > Date.now();
    }),
  );

  readonly pasados = computed(() =>
    this.boletos().filter(
      (b) => b.estado === 'pagada' && new Date(b.fecha_hora).getTime() < Date.now(),
    ),
  );

  readonly cancelados = computed(() =>
    this.boletos().filter(
      (b) => b.estado === 'cancelada' || b.estado === 'reembolsada' || b.estado === 'expirada',
    ),
  );

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  irCartelera() {
    this.router.navigate(['/']);
  }

  cambiarFiltro(filtro: Filtro) {
    this.filtroBoletos.set(filtro);
  }

  boletosFiltrados(): Boleto[] {
    switch (this.filtroBoletos()) {
      case 'proximos':
        return this.proximos();
      case 'pasados':
        return this.pasados();
      case 'cancelados':
        return this.cancelados();
    }
  }

  abrirPoliticas(boleto: Boleto) {
    this.selectedBoleto.set(boleto);
    this.mostrarPoliticas.set(true);
  }

  cerrarPoliticas() {
    this.mostrarPoliticas.set(false);
  }

  cambiarVista(vista: Vista) {
    this.vistaActual.set(vista);
  }

  puedeReenviar(boleto: Boleto): boolean {
    if (boleto.estado !== 'pagada') return false;
    return new Date(boleto.fecha_hora).getTime() > Date.now();
  }
}
