import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MOCK_REEMBOLSOS } from '../../../../mocks/data/reembolsos.mock';
import { Router } from '@angular/router';
import { Reembolso } from '../../../../shared/services/reembolsos.service';

@Component({
  selector: 'app-reembolsos',
  standalone: true,
  imports: [DatePipe],
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

  //agregue un mock solo para probar lo de pendiente y mas de 5 dias
  reembolsos: Reembolso[] = [
    ...MOCK_REEMBOLSOS,
    {
      id: 'rb-pendiente-001',
      id_pago: '999',
      id_politica: '1',
      porcentaje_aplicado: 100,
      monto: 350,
      estado: 'pendiente',
      fecha_procesado: null,
      created_at: '2026-06-10T10:00:00.000Z',
    },
  ];

  actualizarEstado() {
    console.log('Consultando estado del reembolso...');

    // mock de refresh
    this.reembolsos = this.reembolsos.map((r) => ({
      ...r,
      estado: r.estado === 'pendiente' ? 'procesado' : r.estado,
    }));
  }

  superaCincoDias(fecha: string): boolean {
    const fechaSolicitud = new Date(fecha);

    const ahora = new Date();

    const diferencia = ahora.getTime() - fechaSolicitud.getTime();

    const dias = diferencia / (1000 * 60 * 60 * 24);

    return dias > 5;
  }

  volverBoletos() {
    this.router.navigate(['/mis-boletos']);
  }
}
