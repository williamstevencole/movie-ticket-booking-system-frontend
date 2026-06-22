// Precios base sembrados por tipo de asiento (en lempiras).
export const MOCK_PRECIOS_DEFAULTS: Record<string, number> = {
  std: 75,
  vip: 140,
  acc: 75,
};

// Overrides por cine: cineId -> tipoId -> precio.
// Un tipo ausente significa que ese cine hereda el precio "Por defecto".
export const MOCK_PRECIOS_OVERRIDES: Record<string, Record<string, number>> = {
  'gua-1': { std: 85, vip: 165 },
  'gua-2': { std: 80, vip: 150 },
  'gua-3': { std: 75, vip: 140 },
  'sps-1': { std: 80, vip: 150 },
  'tgu-3': { std: 78, vip: 145 },
  'ssv-1': { std: 90, vip: 175, acc: 90 },
  'ssv-2': { std: 85, vip: 160 },
  'xel-1': { std: 70 },
};
