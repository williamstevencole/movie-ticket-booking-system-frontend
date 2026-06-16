import { Reembolso } from '../../shared/services/reembolsos.service';
import { MOCK_PAGOS } from './pagos.mock';
import { MOCK_POLITICAS_CANCELACION } from './politicas-cancelacion.mock';

export const MOCK_REEMBOLSOS: Reembolso[] = MOCK_PAGOS
  .filter((p) => p.estado === 'reembolsado')
  .map((p, i) => {
    const politica = MOCK_POLITICAS_CANCELACION[i % MOCK_POLITICAS_CANCELACION.length]!;
    const pct = [25, 50, 80, 100, 80, 0][i % 6]!;
    const monto = +((p.monto_final * pct) / 100).toFixed(2);
    const fechaProc = new Date(p.created_at);
    fechaProc.setHours(fechaProc.getHours() + 24);
    return {
      id: `rb-${i + 1}`,
      id_pago: p.id,
      id_politica: politica.id,
      porcentaje_aplicado: pct,
      monto,
      estado: pct === 0 ? ('rechazado' as const) : ('procesado' as const),
      fecha_procesado: pct === 0 ? null : fechaProc.toISOString(),
      created_at: p.created_at,
    };
  });
