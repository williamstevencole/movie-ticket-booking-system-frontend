import { TipoAsiento } from '../../shared/services/tipos-asiento.service';

export const MOCK_TIPOS_ASIENTO: TipoAsiento[] = [
  {
    id: 'std',
    nombre: 'Estándar',
    color: '#a8a29e',
    salas_usando: 11,
    asientos_total: 982,
  },
  {
    id: 'vip',
    nombre: 'VIP',
    color: '#e08a1e',
    salas_usando: 6,
    asientos_total: 168,
  },
  {
    id: 'acc',
    nombre: 'Accesible',
    color: '#3b82f6',
    salas_usando: 9,
    asientos_total: 36,
  },
  {
    id: 'din',
    nombre: 'Dinámica 4D',
    color: '#8b5cf6',
    salas_usando: 2,
    asientos_total: 128,
  },
];
