import { Reembolso } from '../../shared/services/reembolsos.service';
import { MOCK_PAGOS } from './pagos.mock';

export const MOCK_REEMBOLSOS: Reembolso[] = MOCK_PAGOS
  .filter((p) => p.estado === 'reembolsado')
  .map((p, i) => {
    const pct = i % 2 === 0 ? 100 : 50;
    const monto = Math.round((p.monto_final * pct) / 100);
    const fechaProc = new Date(p.created_at);
    fechaProc.setHours(fechaProc.getHours() + 24);
    return {
      id: `rb-${i + 1}`,
      id_pago: p.id,
      porcentaje_aplicado: pct,
      monto,
      estado: 'procesado' as const,
      fecha_procesado: fechaProc.toISOString(),
      created_at: p.created_at,
    };
  });
