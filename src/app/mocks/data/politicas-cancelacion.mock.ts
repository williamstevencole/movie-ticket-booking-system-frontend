import { PoliticaCancelacion } from '../../shared/services/politicas-cancelacion.service';

export const MOCK_POLITICAS_CANCELACION: PoliticaCancelacion[] = [
  { id: '1', id_cine: 'gua-1', nombre: 'Flexible 24h',    activa: true,  created_at: '2025-08-10T10:00:00Z' },
  { id: '2', id_cine: 'gua-1', nombre: 'Estricta 12h',    activa: true,  created_at: '2025-08-10T10:00:00Z' },
  { id: '3', id_cine: 'gua-2', nombre: 'Flexible 48h',    activa: true,  created_at: '2025-09-01T10:00:00Z' },
  { id: '4', id_cine: 'gua-2', nombre: 'No reembolsable', activa: true,  created_at: '2025-09-01T10:00:00Z' },
  { id: '5', id_cine: 'sps-1', nombre: 'Promocional',     activa: true,  created_at: '2025-10-15T10:00:00Z' },
  { id: '6', id_cine: 'sps-1', nombre: 'Estricta 6h',     activa: false, created_at: '2025-10-15T10:00:00Z' },
];
