import { Funcion } from '../../shared/services/funciones.service';

function atToday(hour: number, min = 0): string {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function relDay(days: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const MOCK_FUNCIONES: Funcion[] = [
  // ── HOY ───────────────────────────────────────────
  {
    id: 'f-1',
    id_pelicula: 'p-1',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s1',
    fecha_inicio: atToday(14, 30),
    precio_base: 65,
    estado: 'programada',
    boletos_vendidos: 142,
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'f-2',
    id_pelicula: 'p-2',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s2',
    fecha_inicio: atToday(15, 0),
    precio_base: 65,
    estado: 'programada',
    boletos_vendidos: 87,
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'f-3',
    id_pelicula: 'p-5',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s3',
    fecha_inicio: atToday(16, 15),
    precio_base: 55,
    estado: 'programada',
    boletos_vendidos: 96,
    created_at: '2026-05-21T10:00:00Z',
  },
  {
    id: 'f-4',
    id_pelicula: 'p-1',
    id_cine: 'gua-2',
    id_sala: 'gua-2-s1',
    fecha_inicio: atToday(19, 0),
    precio_base: 75,
    estado: 'programada',
    boletos_vendidos: 178,
    created_at: '2026-05-21T10:00:00Z',
  },
  {
    id: 'f-5',
    id_pelicula: 'p-3',
    id_cine: 'gua-2',
    id_sala: 'gua-2-s2',
    fecha_inicio: atToday(20, 45),
    precio_base: 85,
    estado: 'programada',
    boletos_vendidos: 211,
    created_at: '2026-05-21T10:00:00Z',
  },
  {
    id: 'f-6',
    id_pelicula: 'p-8',
    id_cine: 'gua-3',
    id_sala: 'gua-3-s1',
    fecha_inicio: atToday(18, 30),
    precio_base: 60,
    estado: 'programada',
    boletos_vendidos: 64,
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    id: 'f-7',
    id_pelicula: 'p-6',
    id_cine: 'sps-1',
    id_sala: 'sps-1-s1',
    fecha_inicio: atToday(21, 0),
    precio_base: 70,
    estado: 'programada',
    boletos_vendidos: 39,
    created_at: '2026-05-22T10:00:00Z',
  },

  // ── MAÑANA ────────────────────────────────────────
  {
    id: 'f-8',
    id_pelicula: 'p-3',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s4',
    fecha_inicio: relDay(1, 17, 0),
    precio_base: 75,
    estado: 'programada',
    boletos_vendidos: 12,
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    id: 'f-9',
    id_pelicula: 'p-1',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s5',
    fecha_inicio: relDay(1, 20, 15),
    precio_base: 75,
    estado: 'programada',
    boletos_vendidos: 8,
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    id: 'f-10',
    id_pelicula: 'p-5',
    id_cine: 'gua-2',
    id_sala: 'gua-2-s3',
    fecha_inicio: relDay(1, 14, 0),
    precio_base: 55,
    estado: 'programada',
    boletos_vendidos: 21,
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    id: 'f-11',
    id_pelicula: 'p-2',
    id_cine: 'sps-1',
    id_sala: 'sps-1-s2',
    fecha_inicio: relDay(1, 19, 45),
    precio_base: 70,
    estado: 'programada',
    boletos_vendidos: 4,
    created_at: '2026-05-23T10:00:00Z',
  },
  {
    id: 'f-12',
    id_pelicula: 'p-8',
    id_cine: 'tgu-1',
    id_sala: 'tgu-1-s1',
    fecha_inicio: relDay(2, 16, 30),
    precio_base: 80,
    estado: 'programada',
    boletos_vendidos: 0,
    created_at: '2026-05-23T10:00:00Z',
  },
  {
    id: 'f-13',
    id_pelicula: 'p-3',
    id_cine: 'ssv-1',
    id_sala: 'ssv-1-s1',
    fecha_inicio: relDay(3, 18, 0),
    precio_base: 65,
    estado: 'programada',
    boletos_vendidos: 0,
    created_at: '2026-05-23T10:00:00Z',
  },

  // ── HISTÓRICO / CANCELADA ─────────────────────────
  {
    id: 'f-14',
    id_pelicula: 'p-7',
    id_cine: 'gua-1',
    id_sala: 'gua-1-s6',
    fecha_inicio: relDay(-2, 20, 0),
    precio_base: 65,
    estado: 'finalizada',
    boletos_vendidos: 89,
    created_at: '2026-04-30T10:00:00Z',
  },
  {
    id: 'f-15',
    id_pelicula: 'p-4',
    id_cine: 'gua-2',
    id_sala: 'gua-2-s4',
    fecha_inicio: relDay(-5, 19, 30),
    precio_base: 65,
    estado: 'cancelada',
    boletos_vendidos: 47,
    created_at: '2026-04-28T10:00:00Z',
  },
];
