import { TipoAsiento } from '../../shared/services/tipos-asiento.service';

export const MOCK_TIPOS_ASIENTO: TipoAsiento[] = [
  {
    id: 'std',
    nombre: 'Estándar',
    color: '#a8a29e',
    activo: true,
    salas_usando: 11,
    asientos_total: 982,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'vip',
    nombre: 'VIP',
    color: '#e08a1e',
    activo: true,
    salas_usando: 6,
    asientos_total: 168,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'acc',
    nombre: 'Accesible',
    color: '#3b82f6',
    activo: true,
    salas_usando: 9,
    asientos_total: 36,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'din',
    nombre: 'Dinámica 4D',
    color: '#8b5cf6',
    activo: false,
    salas_usando: 0,
    asientos_total: 0,
    created_at: '2026-02-01T00:00:00Z',
  },
];
