import { Cupon } from '../../shared/services/cupones.service';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const MOCK_CUPONES: Cupon[] = [
  {
    id: '1',
    codigo: 'BIENVENIDA10',
    tipo: 'porcentaje',
    valor: 10,
    fecha_expiracion: daysFromNow(90),
    usos_maximos: 1000,
    usos_actuales: 248,
    activo: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    codigo: 'VERANO20',
    tipo: 'porcentaje',
    valor: 20,
    fecha_expiracion: daysFromNow(5),
    usos_maximos: 500,
    usos_actuales: 423,
    activo: true,
    created_at: '2026-04-10T00:00:00Z',
  },
  {
    id: '3',
    codigo: 'ESTRENO5',
    tipo: 'monto',
    valor: 5,
    fecha_expiracion: daysFromNow(30),
    usos_maximos: 200,
    usos_actuales: 47,
    activo: true,
    created_at: '2026-05-15T00:00:00Z',
  },
  {
    id: '4',
    codigo: 'FAMILIA15',
    tipo: 'porcentaje',
    valor: 15,
    fecha_expiracion: daysFromNow(120),
    usos_maximos: 300,
    usos_actuales: 89,
    activo: true,
    created_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '5',
    codigo: 'ESTUDIANTE25',
    tipo: 'porcentaje',
    valor: 25,
    fecha_expiracion: daysFromNow(180),
    usos_maximos: null,
    usos_actuales: 312,
    activo: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '6',
    codigo: 'NAVIDAD30',
    tipo: 'porcentaje',
    valor: 30,
    fecha_expiracion: daysFromNow(-12),
    usos_maximos: 1000,
    usos_actuales: 967,
    activo: true,
    created_at: '2025-11-01T00:00:00Z',
  },
];
