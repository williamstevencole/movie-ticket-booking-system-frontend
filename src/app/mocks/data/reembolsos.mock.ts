import { MiReembolso } from '../../shared/services/mis-reembolsos.service';

export const MOCK_REEMBOLSOS: MiReembolso[] = [
  { id: 'rb-1', id_pago: 'pago-101', id_politica: '1', porcentaje_aplicado: 25,  monto: 37.50,  estado: 'procesado',  fecha_procesado: '2025-09-11T10:00:00Z', created_at: '2025-09-10T10:00:00Z' },
  { id: 'rb-2', id_pago: 'pago-102', id_politica: '2', porcentaje_aplicado: 50,  monto: 75.00,  estado: 'procesado',  fecha_procesado: '2025-09-12T10:00:00Z', created_at: '2025-09-11T10:00:00Z' },
  { id: 'rb-3', id_pago: 'pago-103', id_politica: '3', porcentaje_aplicado: 80,  monto: 120.00, estado: 'procesado',  fecha_procesado: '2025-10-02T10:00:00Z', created_at: '2025-10-01T10:00:00Z' },
  { id: 'rb-4', id_pago: 'pago-104', id_politica: '4', porcentaje_aplicado: 100, monto: 150.00, estado: 'procesado',  fecha_procesado: '2025-10-16T10:00:00Z', created_at: '2025-10-15T10:00:00Z' },
  { id: 'rb-5', id_pago: 'pago-105', id_politica: '5', porcentaje_aplicado: 80,  monto: 96.00,  estado: 'procesado',  fecha_procesado: '2025-11-06T10:00:00Z', created_at: '2025-11-05T10:00:00Z' },
  { id: 'rb-6', id_pago: 'pago-106', id_politica: '6', porcentaje_aplicado: 0,   monto: 0,      estado: 'rechazado',  fecha_procesado: null,                   created_at: '2025-11-20T10:00:00Z' },
];
