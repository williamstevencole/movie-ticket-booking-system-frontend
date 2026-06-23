import {
  Reserva,
  ReservaAsiento,
  ReservaUsuario,
} from '../../shared/services/reservas.service';

export const MOCK_USUARIOS_RESERVAS: ReservaUsuario[] = [
  { id: 'u-1', nombre: 'Andrea López', email: 'andrea.lopez@gmail.com' },
  { id: 'u-2', nombre: 'Marco Rodríguez', email: 'marco.rod@gmail.com' },
  { id: 'u-3', nombre: 'Sofía García', email: 'sofia.garcia@outlook.com' },
  { id: 'u-4', nombre: 'Daniel Méndez', email: 'dmendez@gmail.com' },
  { id: 'u-5', nombre: 'Lucía Hernández', email: 'lucia.h@hotmail.com' },
  { id: 'u-6', nombre: 'Pablo Castillo', email: 'pcastillo@gmail.com' },
  { id: 'u-7', nombre: 'Camila Reyes', email: 'cami.reyes@gmail.com' },
  { id: 'u-8', nombre: 'Javier Morales', email: 'j.morales@yahoo.com' },
  { id: 'u-9', nombre: 'Isabella Cruz', email: 'isa.cruz@gmail.com' },
  { id: 'u-10', nombre: 'Rodrigo Paz', email: 'rpaz@gmail.com' },
  { id: 'u-11', nombre: 'Valeria Torres', email: 'valeria.t@gmail.com' },
  { id: 'u-12', nombre: 'Mateo Aguilar', email: 'mateo.a@gmail.com' },
];

function daysAgo(d: number, h = 14, m = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

function minutesAhead(m: number): string {
  return new Date(Date.now() + m * 60_000).toISOString();
}

const ROWS = 'ABCDEFGHIJ';

/**
 * Generates a deterministic list of ReservaAsiento objects from a seed string.
 * Each seat gets a plausible id, id_asiento_funcion, fila, columna, tipo_asiento, and precio.
 */
function makeAsientos(reservaId: string, n: number): ReservaAsiento[] {
  let h = 0;
  for (let i = 0; i < reservaId.length; i++) h = (h * 31 + reservaId.charCodeAt(i)) % 10_000;
  const rowIdx = h % ROWS.length;
  const startCol = 1 + (h % 9);
  const fila = ROWS[rowIdx];

  // Alternate seat types based on row index for variety
  const tipo = rowIdx >= 7 ? 'VIP' : rowIdx >= 5 ? 'Premium' : 'Estandar';
  const precio = tipo === 'VIP' ? 85 : tipo === 'Premium' ? 75 : 65;

  return Array.from({ length: n }, (_, i) => {
    const columna = startCol + i;
    const codigo = `${fila}${columna}`;
    return {
      id: `ra-${reservaId}-${i + 1}`,
      id_asiento_funcion: `af-${reservaId}-${columna}`,
      codigo,
      fila,
      columna,
      tipo_asiento: tipo,
      precio,
    };
  });
}

export const MOCK_RESERVAS: Reserva[] = [
  // ── últimos 7 días ────────────────────────────────
  {
    id: 'r-1', numero_reserva: 'CIN-A-0001',
    id_usuario: 'u-1', id_funcion: 'f-1',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(0, 10, 15), updated_at: daysAgo(0, 10, 17),
    asientos: makeAsientos('r-1', 2),
  },
  {
    id: 'r-2', numero_reserva: 'CIN-A-0002',
    id_usuario: 'u-2', id_funcion: 'f-1',
    estado: 'pagada', num_asientos: 4, monto_total: 260,
    created_at: daysAgo(0, 11, 5), updated_at: daysAgo(0, 11, 7),
    asientos: makeAsientos('r-2', 4),
    cupon_codigo: 'CINE15',
  },
  {
    id: 'r-3', numero_reserva: 'CIN-A-0003',
    id_usuario: 'u-3', id_funcion: 'f-2',
    estado: 'pendiente_pago', num_asientos: 2, monto_total: 130,
    created_at: minutesAgo(8), updated_at: minutesAgo(8),
    expira_en: minutesAhead(7),
    asientos: makeAsientos('r-3', 2),
  },
  {
    id: 'r-4', numero_reserva: 'CIN-A-0004',
    id_usuario: 'u-4', id_funcion: 'f-4',
    estado: 'pagada', num_asientos: 3, monto_total: 225,
    created_at: daysAgo(0, 15, 30), updated_at: daysAgo(0, 15, 32),
    asientos: makeAsientos('r-4', 3),
  },
  {
    id: 'r-5', numero_reserva: 'CIN-A-0005',
    id_usuario: 'u-5', id_funcion: 'f-5',
    estado: 'pagada', num_asientos: 2, monto_total: 170,
    created_at: daysAgo(1, 19, 10), updated_at: daysAgo(1, 19, 12),
    asientos: makeAsientos('r-5', 2),
  },
  {
    id: 'r-6', numero_reserva: 'CIN-A-0006',
    id_usuario: 'u-6', id_funcion: 'f-5',
    estado: 'cancelada', num_asientos: 2, monto_total: 170,
    created_at: daysAgo(1, 20, 0), updated_at: daysAgo(1, 22, 0),
    asientos: makeAsientos('r-6', 2),
    notas_internas: 'Cancelada a solicitud del cliente · llamada de soporte 21:42',
  },
  {
    id: 'r-7', numero_reserva: 'CIN-A-0007',
    id_usuario: 'u-7', id_funcion: 'f-6',
    estado: 'pagada', num_asientos: 4, monto_total: 240,
    created_at: daysAgo(2, 12, 0), updated_at: daysAgo(2, 12, 3),
    asientos: makeAsientos('r-7', 4),
  },
  {
    id: 'r-8', numero_reserva: 'CIN-A-0008',
    id_usuario: 'u-8', id_funcion: 'f-7',
    estado: 'pagada', num_asientos: 1, monto_total: 70,
    created_at: daysAgo(2, 18, 45), updated_at: daysAgo(2, 18, 47),
    asientos: makeAsientos('r-8', 1),
  },
  {
    id: 'r-9', numero_reserva: 'CIN-A-0009',
    id_usuario: 'u-9', id_funcion: 'f-8',
    estado: 'reembolsada', num_asientos: 2, monto_total: 150,
    created_at: daysAgo(3, 14, 0), updated_at: daysAgo(2, 9, 0),
    asientos: makeAsientos('r-9', 2),
    notas_internas: 'Reembolso 80% aprobado · política A (más de 24h antes)',
  },
  {
    id: 'r-10', numero_reserva: 'CIN-A-0010',
    id_usuario: 'u-10', id_funcion: 'f-14',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(3, 16, 30), updated_at: daysAgo(3, 16, 32),
    asientos: makeAsientos('r-10', 2),
  },
  {
    id: 'r-11', numero_reserva: 'CIN-A-0011',
    id_usuario: 'u-11', id_funcion: 'f-15',
    estado: 'reembolsada', num_asientos: 3, monto_total: 195,
    created_at: daysAgo(5, 11, 0), updated_at: daysAgo(4, 14, 0),
    asientos: makeAsientos('r-11', 3),
    cupon_codigo: 'PROMO20',
  },
  {
    id: 'r-12', numero_reserva: 'CIN-A-0012',
    id_usuario: 'u-12', id_funcion: 'f-3',
    estado: 'pagada', num_asientos: 2, monto_total: 110,
    created_at: daysAgo(4, 17, 0), updated_at: daysAgo(4, 17, 2),
    asientos: makeAsientos('r-12', 2),
  },
  {
    id: 'r-13', numero_reserva: 'CIN-A-0013',
    id_usuario: 'u-1', id_funcion: 'f-12',
    estado: 'pendiente_pago', num_asientos: 5, monto_total: 400,
    created_at: minutesAgo(13), updated_at: minutesAgo(13),
    expira_en: minutesAhead(2),
    asientos: makeAsientos('r-13', 5),
  },
  {
    id: 'r-14', numero_reserva: 'CIN-A-0014',
    id_usuario: 'u-3', id_funcion: 'f-13',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(6, 13, 30), updated_at: daysAgo(6, 13, 32),
    asientos: makeAsientos('r-14', 2),
  },
  {
    id: 'r-15', numero_reserva: 'CIN-A-0015',
    id_usuario: 'u-7', id_funcion: 'f-9',
    estado: 'pagada', num_asientos: 4, monto_total: 300,
    created_at: daysAgo(6, 20, 0), updated_at: daysAgo(6, 20, 2),
    asientos: makeAsientos('r-15', 4),
  },
  // ── últimos 30 días ───────────────────────────────
  {
    id: 'r-16', numero_reserva: 'CIN-A-0016',
    id_usuario: 'u-2', id_funcion: 'f-10',
    estado: 'pagada', num_asientos: 2, monto_total: 110,
    created_at: daysAgo(10, 14, 0), updated_at: daysAgo(10, 14, 1),
    asientos: makeAsientos('r-16', 2),
  },
  {
    id: 'r-17', numero_reserva: 'CIN-A-0017',
    id_usuario: 'u-5', id_funcion: 'f-11',
    estado: 'reembolsada', num_asientos: 3, monto_total: 210,
    created_at: daysAgo(12, 10, 0), updated_at: daysAgo(11, 12, 0),
    asientos: makeAsientos('r-17', 3),
  },
  {
    id: 'r-18', numero_reserva: 'CIN-A-0018',
    id_usuario: 'u-8', id_funcion: 'f-14',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(15, 18, 0), updated_at: daysAgo(15, 18, 2),
    asientos: makeAsientos('r-18', 2),
  },
  {
    id: 'r-19', numero_reserva: 'CIN-A-0019',
    id_usuario: 'u-9', id_funcion: 'f-6',
    estado: 'cancelada', num_asientos: 2, monto_total: 120,
    created_at: daysAgo(18, 11, 0), updated_at: daysAgo(18, 14, 0),
    asientos: makeAsientos('r-19', 2),
  },
  {
    id: 'r-20', numero_reserva: 'CIN-A-0020',
    id_usuario: 'u-4', id_funcion: 'f-7',
    estado: 'pagada', num_asientos: 6, monto_total: 420,
    created_at: daysAgo(22, 16, 0), updated_at: daysAgo(22, 16, 2),
    asientos: makeAsientos('r-20', 6),
  },
  // ── últimos 6 meses · cancelaciones / reembolsos ──
  // Mes actual (junio 2026)
  {
    id: 'r-21', numero_reserva: 'CIN-A-0021',
    id_usuario: 'u-2', id_funcion: 'f-8',
    estado: 'reembolsada', num_asientos: 2, monto_total: 140,
    created_at: daysAgo(18, 12, 30), updated_at: daysAgo(17, 9, 0),
    asientos: makeAsientos('r-21', 2),
    notas_internas: 'Reembolso 80% aprobado · política A',
  },
  {
    id: 'r-22', numero_reserva: 'CIN-A-0022',
    id_usuario: 'u-6', id_funcion: 'f-10',
    estado: 'reembolsada', num_asientos: 3, monto_total: 210,
    created_at: daysAgo(27, 19, 0), updated_at: daysAgo(26, 11, 0),
    asientos: makeAsientos('r-22', 3),
  },
  // Mes -1 (mayo 2026)
  {
    id: 'r-23', numero_reserva: 'CIN-A-0023',
    id_usuario: 'u-3', id_funcion: 'f-5',
    estado: 'reembolsada', num_asientos: 2, monto_total: 150,
    created_at: daysAgo(38, 14, 0), updated_at: daysAgo(37, 16, 0),
    asientos: makeAsientos('r-23', 2),
    cupon_codigo: 'CINE15',
  },
  {
    id: 'r-24', numero_reserva: 'CIN-A-0024',
    id_usuario: 'u-9', id_funcion: 'f-11',
    estado: 'cancelada', num_asientos: 4, monto_total: 280,
    created_at: daysAgo(50, 10, 0), updated_at: daysAgo(50, 13, 0),
    asientos: makeAsientos('r-24', 4),
    notas_internas: 'Cancelada por el cliente',
  },
  {
    id: 'r-25', numero_reserva: 'CIN-A-0025',
    id_usuario: 'u-11', id_funcion: 'f-6',
    estado: 'reembolsada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(56, 17, 0), updated_at: daysAgo(55, 9, 0),
    asientos: makeAsientos('r-25', 2),
  },
  // Mes -2 (abril 2026)
  {
    id: 'r-26', numero_reserva: 'CIN-A-0026',
    id_usuario: 'u-1', id_funcion: 'f-9',
    estado: 'reembolsada', num_asientos: 3, monto_total: 225,
    created_at: daysAgo(70, 15, 0), updated_at: daysAgo(69, 12, 0),
    asientos: makeAsientos('r-26', 3),
    notas_internas: 'Reembolso 50% · política B (menos de 24h)',
  },
  {
    id: 'r-27', numero_reserva: 'CIN-A-0027',
    id_usuario: 'u-5', id_funcion: 'f-12',
    estado: 'reembolsada', num_asientos: 2, monto_total: 160,
    created_at: daysAgo(84, 11, 0), updated_at: daysAgo(83, 14, 0),
    asientos: makeAsientos('r-27', 2),
    cupon_codigo: 'PROMO20',
  },
  // Mes -3 (marzo 2026)
  {
    id: 'r-28', numero_reserva: 'CIN-A-0028',
    id_usuario: 'u-8', id_funcion: 'f-3',
    estado: 'reembolsada', num_asientos: 4, monto_total: 320,
    created_at: daysAgo(97, 18, 0), updated_at: daysAgo(96, 10, 0),
    asientos: makeAsientos('r-28', 4),
  },
  {
    id: 'r-29', numero_reserva: 'CIN-A-0029',
    id_usuario: 'u-12', id_funcion: 'f-13',
    estado: 'cancelada', num_asientos: 2, monto_total: 110,
    created_at: daysAgo(110, 13, 0), updated_at: daysAgo(110, 15, 0),
    asientos: makeAsientos('r-29', 2),
    notas_internas: 'Cancelada por error de pago',
  },
  {
    id: 'r-30', numero_reserva: 'CIN-A-0030',
    id_usuario: 'u-7', id_funcion: 'f-14',
    estado: 'reembolsada', num_asientos: 2, monto_total: 140,
    created_at: daysAgo(122, 16, 30), updated_at: daysAgo(121, 11, 0),
    asientos: makeAsientos('r-30', 2),
  },
  // Mes -4 (febrero 2026)
  {
    id: 'r-31', numero_reserva: 'CIN-A-0031',
    id_usuario: 'u-4', id_funcion: 'f-15',
    estado: 'reembolsada', num_asientos: 3, monto_total: 195,
    created_at: daysAgo(135, 14, 0), updated_at: daysAgo(134, 9, 30),
    asientos: makeAsientos('r-31', 3),
    notas_internas: 'Reembolso 80% aprobado',
  },
  {
    id: 'r-32', numero_reserva: 'CIN-A-0032',
    id_usuario: 'u-10', id_funcion: 'f-7',
    estado: 'reembolsada', num_asientos: 2, monto_total: 150,
    created_at: daysAgo(148, 19, 0), updated_at: daysAgo(147, 10, 0),
    asientos: makeAsientos('r-32', 2),
  },
  // Mes -5 (enero 2026)
  {
    id: 'r-33', numero_reserva: 'CIN-A-0033',
    id_usuario: 'u-2', id_funcion: 'f-4',
    estado: 'reembolsada', num_asientos: 4, monto_total: 300,
    created_at: daysAgo(160, 12, 0), updated_at: daysAgo(159, 14, 0),
    asientos: makeAsientos('r-33', 4),
    cupon_codigo: 'CINE15',
  },
  {
    id: 'r-34', numero_reserva: 'CIN-A-0034',
    id_usuario: 'u-6', id_funcion: 'f-1',
    estado: 'cancelada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(170, 20, 0), updated_at: daysAgo(170, 22, 0),
    asientos: makeAsientos('r-34', 2),
    notas_internas: 'Cancelada · no se completó el pago',
  },
  {
    id: 'r-35', numero_reserva: 'CIN-A-0035',
    id_usuario: 'u-9', id_funcion: 'f-2',
    estado: 'reembolsada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(178, 15, 0), updated_at: daysAgo(177, 11, 0),
    asientos: makeAsientos('r-35', 2),
  },
];
