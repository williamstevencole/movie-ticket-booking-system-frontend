import { Ciudad } from '../../shared/services/ciudades.service';

/**
 * Lista de ciudades para desarrollo. Coincide con la lista del seed del
 * backend (`api/prisma/seed/ciudades.ts`) para que el flujo end-to-end
 * funcione igual cuando cambies a HTTP real.
 */
export const MOCK_CIUDADES: Ciudad[] = [
  { id: '1', nombre: 'Guatemala', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', nombre: 'San Pedro Sula', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', nombre: 'Tegucigalpa', created_at: '2026-01-01T00:00:00Z' },
  { id: '4', nombre: 'Santa Ana', created_at: '2026-01-01T00:00:00Z' },
  { id: '5', nombre: 'San Salvador', created_at: '2026-01-01T00:00:00Z' },
  { id: '6', nombre: 'El Progreso', created_at: '2026-01-01T00:00:00Z' },
  { id: '7', nombre: 'Choloma', created_at: '2026-01-01T00:00:00Z' },
  { id: '8', nombre: 'Quetzaltenango', created_at: '2026-01-01T00:00:00Z' },
  { id: '9', nombre: 'La Ceiba', created_at: '2026-01-01T00:00:00Z' },
  { id: '10', nombre: 'Comayagua', created_at: '2026-01-01T00:00:00Z' },
];
