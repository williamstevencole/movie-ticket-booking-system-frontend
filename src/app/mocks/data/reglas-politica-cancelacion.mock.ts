import { ReglaPolitica } from '../../shared/services/politicas-cancelacion.service';

// Reglas para las 6 políticas del mock (ids '1' … '6').
// Cada política tiene 3-4 reglas escalonadas sin traslapes.
//
// Política '1' — Flexible 24h (cine gua-1)
// Política '2' — Estricta 12h (cine gua-1)
// Política '3' — Flexible 48h (cine gua-2)
// Política '4' — No reembolsable (cine gua-2)
// Política '5' — Promocional (cine sps-1)
// Política '6' — Estricta 6h   (cine sps-1, inactiva)

export const MOCK_REGLAS_POLITICA: ReglaPolitica[] = [
  // ── Política 1: Flexible 24h ──────────────────────────────────────────────
  // 0-12h → sin reembolso; 12-24h → 50%; 24-72h → 80%; 72h+ → 100%
  { id: 'rp-101', id_politica: '1', horas_antes_minimo:  0, horas_antes_maximo:   12, porcentaje_reembolso:   0 },
  { id: 'rp-102', id_politica: '1', horas_antes_minimo: 12, horas_antes_maximo:   24, porcentaje_reembolso:  50 },
  { id: 'rp-103', id_politica: '1', horas_antes_minimo: 24, horas_antes_maximo:   72, porcentaje_reembolso:  80 },
  { id: 'rp-104', id_politica: '1', horas_antes_minimo: 72, horas_antes_maximo: null, porcentaje_reembolso: 100 },

  // ── Política 2: Estricta 12h ──────────────────────────────────────────────
  // 0-12h → 0%; 12h+ → 80%
  { id: 'rp-201', id_politica: '2', horas_antes_minimo:  0, horas_antes_maximo:   12, porcentaje_reembolso:   0 },
  { id: 'rp-202', id_politica: '2', horas_antes_minimo: 12, horas_antes_maximo: null, porcentaje_reembolso:  80 },

  // ── Política 3: Flexible 48h ──────────────────────────────────────────────
  // 0-12h → 0%; 12-48h → 70%; 48-120h → 90%; 120h+ → 100%
  { id: 'rp-301', id_politica: '3', horas_antes_minimo:   0, horas_antes_maximo:   12, porcentaje_reembolso:   0 },
  { id: 'rp-302', id_politica: '3', horas_antes_minimo:  12, horas_antes_maximo:   48, porcentaje_reembolso:  70 },
  { id: 'rp-303', id_politica: '3', horas_antes_minimo:  48, horas_antes_maximo:  120, porcentaje_reembolso:  90 },
  { id: 'rp-304', id_politica: '3', horas_antes_minimo: 120, horas_antes_maximo: null, porcentaje_reembolso: 100 },

  // ── Política 4: No reembolsable ───────────────────────────────────────────
  // Cualquier momento → 0%
  { id: 'rp-401', id_politica: '4', horas_antes_minimo: 0, horas_antes_maximo: null, porcentaje_reembolso: 0 },

  // ── Política 5: Promocional ───────────────────────────────────────────────
  // 0-6h → 0%; 6-24h → 40%; 24h+ → 60%
  { id: 'rp-501', id_politica: '5', horas_antes_minimo:  0, horas_antes_maximo:   6, porcentaje_reembolso:  0 },
  { id: 'rp-502', id_politica: '5', horas_antes_minimo:  6, horas_antes_maximo:  24, porcentaje_reembolso: 40 },
  { id: 'rp-503', id_politica: '5', horas_antes_minimo: 24, horas_antes_maximo: null, porcentaje_reembolso: 60 },

  // ── Política 6: Estricta 6h (inactiva) ───────────────────────────────────
  // 0-6h → 0%; 6-12h → 30%; 12h+ → 75%
  { id: 'rp-601', id_politica: '6', horas_antes_minimo:  0, horas_antes_maximo:   6, porcentaje_reembolso:  0 },
  { id: 'rp-602', id_politica: '6', horas_antes_minimo:  6, horas_antes_maximo:  12, porcentaje_reembolso: 30 },
  { id: 'rp-603', id_politica: '6', horas_antes_minimo: 12, horas_antes_maximo: null, porcentaje_reembolso: 75 },
];
