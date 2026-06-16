import { Pago } from '../../shared/services/pagos.service';
import { MOCK_RESERVAS } from './reservas.mock';

function ref(): string {
  return 'TX' + Math.floor(100000 + Math.random() * 900000).toString();
}

function dummyRef(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1_000_000;
  return 'TX' + String(100000 + h).slice(0, 6);
}

const cards = ['4242', '5555', '3782', '6011', '1234', '9876', '4400', '5500'];

export const MOCK_PAGOS: Pago[] = MOCK_RESERVAS
  .filter((r) => r.estado !== 'pendiente_pago')
  .map((r, i) => {
    const isCancel = r.estado === 'cancelada';
    const isRefund = r.estado === 'reembolsada';
    const card = cards[i % cards.length]!;
    const metodo: Pago['metodo'] = i % 4 === 0 ? 'efectivo' : 'tarjeta';
    const estado: Pago['estado'] = isRefund
      ? 'reembolsado'
      : isCancel
        ? 'rechazado'
        : 'exitoso';
    const discount = i % 5 === 0 ? Math.round(r.monto_total * 0.15) : 0;
    return {
      id: `pg-${i + 1}`,
      id_reserva: r.id,
      monto_original: r.monto_total,
      monto_descuento: discount,
      monto_final: r.monto_total - discount,
      metodo,
      estado,
      referencia_externa: metodo === 'tarjeta' ? dummyRef(r.id) : null,
      tarjeta_mask: metodo === 'tarjeta' ? `****${card}` : null,
      created_at: r.created_at,
    };
  });
