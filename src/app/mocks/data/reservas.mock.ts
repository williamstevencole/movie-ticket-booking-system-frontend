import {
  Reserva,
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
function asientos(seed: string, n: number): string[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 10_000;
  const rowIdx = h % ROWS.length;
  const startCol = 1 + (h % 9);
  const row = ROWS[rowIdx];
  return Array.from({ length: n }, (_, i) => `${row}${startCol + i}`);
}

export const MOCK_RESERVAS: Reserva[] = [
  // ── últimos 7 días ────────────────────────────────
  {
    id: 'r-1', numero_reserva: 'CIN-A-0001',
    id_usuario: 'u-1', id_funcion: 'f-1',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(0, 10, 15), updated_at: daysAgo(0, 10, 17),
    asientos_codigos: asientos('r-1', 2),
  },
  {
    id: 'r-2', numero_reserva: 'CIN-A-0002',
    id_usuario: 'u-2', id_funcion: 'f-1',
    estado: 'pagada', num_asientos: 4, monto_total: 260,
    created_at: daysAgo(0, 11, 5), updated_at: daysAgo(0, 11, 7),
    asientos_codigos: asientos('r-2', 4),
    cupon_codigo: 'CINE15',
  },
  {
    id: 'r-3', numero_reserva: 'CIN-A-0003',
    id_usuario: 'u-3', id_funcion: 'f-2',
    estado: 'pendiente_pago', num_asientos: 2, monto_total: 130,
    created_at: minutesAgo(8), updated_at: minutesAgo(8),
    expira_en: minutesAhead(7),
    asientos_codigos: asientos('r-3', 2),
  },
  {
    id: 'r-4', numero_reserva: 'CIN-A-0004',
    id_usuario: 'u-4', id_funcion: 'f-4',
    estado: 'pagada', num_asientos: 3, monto_total: 225,
    created_at: daysAgo(0, 15, 30), updated_at: daysAgo(0, 15, 32),
    asientos_codigos: asientos('r-4', 3),
  },
  {
    id: 'r-5', numero_reserva: 'CIN-A-0005',
    id_usuario: 'u-5', id_funcion: 'f-5',
    estado: 'pagada', num_asientos: 2, monto_total: 170,
    created_at: daysAgo(1, 19, 10), updated_at: daysAgo(1, 19, 12),
    asientos_codigos: asientos('r-5', 2),
  },
  {
    id: 'r-6', numero_reserva: 'CIN-A-0006',
    id_usuario: 'u-6', id_funcion: 'f-5',
    estado: 'cancelada', num_asientos: 2, monto_total: 170,
    created_at: daysAgo(1, 20, 0), updated_at: daysAgo(1, 22, 0),
    asientos_codigos: asientos('r-6', 2),
    notas_internas: 'Cancelada a solicitud del cliente · llamada de soporte 21:42',
  },
  {
    id: 'r-7', numero_reserva: 'CIN-A-0007',
    id_usuario: 'u-7', id_funcion: 'f-6',
    estado: 'pagada', num_asientos: 4, monto_total: 240,
    created_at: daysAgo(2, 12, 0), updated_at: daysAgo(2, 12, 3),
    asientos_codigos: asientos('r-7', 4),
  },
  {
    id: 'r-8', numero_reserva: 'CIN-A-0008',
    id_usuario: 'u-8', id_funcion: 'f-7',
    estado: 'pagada', num_asientos: 1, monto_total: 70,
    created_at: daysAgo(2, 18, 45), updated_at: daysAgo(2, 18, 47),
    asientos_codigos: asientos('r-8', 1),
  },
  {
    id: 'r-9', numero_reserva: 'CIN-A-0009',
    id_usuario: 'u-9', id_funcion: 'f-8',
    estado: 'reembolsada', num_asientos: 2, monto_total: 150,
    created_at: daysAgo(3, 14, 0), updated_at: daysAgo(2, 9, 0),
    asientos_codigos: asientos('r-9', 2),
    notas_internas: 'Reembolso 80% aprobado · política A (más de 24h antes)',
  },
  {
    id: 'r-10', numero_reserva: 'CIN-A-0010',
    id_usuario: 'u-10', id_funcion: 'f-14',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(3, 16, 30), updated_at: daysAgo(3, 16, 32),
    asientos_codigos: asientos('r-10', 2),
  },
  {
    id: 'r-11', numero_reserva: 'CIN-A-0011',
    id_usuario: 'u-11', id_funcion: 'f-15',
    estado: 'reembolsada', num_asientos: 3, monto_total: 195,
    created_at: daysAgo(5, 11, 0), updated_at: daysAgo(4, 14, 0),
    asientos_codigos: asientos('r-11', 3),
    cupon_codigo: 'PROMO20',
  },
  {
    id: 'r-12', numero_reserva: 'CIN-A-0012',
    id_usuario: 'u-12', id_funcion: 'f-3',
    estado: 'pagada', num_asientos: 2, monto_total: 110,
    created_at: daysAgo(4, 17, 0), updated_at: daysAgo(4, 17, 2),
    asientos_codigos: asientos('r-12', 2),
  },
  {
    id: 'r-13', numero_reserva: 'CIN-A-0013',
    id_usuario: 'u-1', id_funcion: 'f-12',
    estado: 'pendiente_pago', num_asientos: 5, monto_total: 400,
    created_at: minutesAgo(13), updated_at: minutesAgo(13),
    expira_en: minutesAhead(2),
    asientos_codigos: asientos('r-13', 5),
  },
  {
    id: 'r-14', numero_reserva: 'CIN-A-0014',
    id_usuario: 'u-3', id_funcion: 'f-13',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(6, 13, 30), updated_at: daysAgo(6, 13, 32),
    asientos_codigos: asientos('r-14', 2),
  },
  {
    id: 'r-15', numero_reserva: 'CIN-A-0015',
    id_usuario: 'u-7', id_funcion: 'f-9',
    estado: 'pagada', num_asientos: 4, monto_total: 300,
    created_at: daysAgo(6, 20, 0), updated_at: daysAgo(6, 20, 2),
    asientos_codigos: asientos('r-15', 4),
  },
  // ── últimos 30 días ───────────────────────────────
  {
    id: 'r-16', numero_reserva: 'CIN-A-0016',
    id_usuario: 'u-2', id_funcion: 'f-10',
    estado: 'pagada', num_asientos: 2, monto_total: 110,
    created_at: daysAgo(10, 14, 0), updated_at: daysAgo(10, 14, 1),
    asientos_codigos: asientos('r-16', 2),
  },
  {
    id: 'r-17', numero_reserva: 'CIN-A-0017',
    id_usuario: 'u-5', id_funcion: 'f-11',
    estado: 'reembolsada', num_asientos: 3, monto_total: 210,
    created_at: daysAgo(12, 10, 0), updated_at: daysAgo(11, 12, 0),
    asientos_codigos: asientos('r-17', 3),
  },
  {
    id: 'r-18', numero_reserva: 'CIN-A-0018',
    id_usuario: 'u-8', id_funcion: 'f-14',
    estado: 'pagada', num_asientos: 2, monto_total: 130,
    created_at: daysAgo(15, 18, 0), updated_at: daysAgo(15, 18, 2),
    asientos_codigos: asientos('r-18', 2),
  },
  {
    id: 'r-19', numero_reserva: 'CIN-A-0019',
    id_usuario: 'u-9', id_funcion: 'f-6',
    estado: 'cancelada', num_asientos: 2, monto_total: 120,
    created_at: daysAgo(18, 11, 0), updated_at: daysAgo(18, 14, 0),
    asientos_codigos: asientos('r-19', 2),
  },
  {
    id: 'r-20', numero_reserva: 'CIN-A-0020',
    id_usuario: 'u-4', id_funcion: 'f-7',
    estado: 'pagada', num_asientos: 6, monto_total: 420,
    created_at: daysAgo(22, 16, 0), updated_at: daysAgo(22, 16, 2),
    asientos_codigos: asientos('r-20', 6),
  },
];
