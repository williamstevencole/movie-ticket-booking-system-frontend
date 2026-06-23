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

type CardSeed = { last: string; brand: 'visa' | 'master' | 'amex' | 'discover' };
const cards: CardSeed[] = [
  { last: '4242', brand: 'visa' },
  { last: '5555', brand: 'master' },
  { last: '3782', brand: 'amex' },
  { last: '6011', brand: 'discover' },
  { last: '1234', brand: 'visa' },
  { last: '9876', brand: 'master' },
  { last: '4400', brand: 'visa' },
  { last: '5500', brand: 'master' },
];

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
      ultimos4_snapshot: metodo === 'tarjeta' ? `****${card.last}` : null,
      marca_snapshot: metodo === 'tarjeta' ? card.brand : undefined,
      created_at: r.created_at,
    };
  });
