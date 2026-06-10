import { Cine, Sala } from '../../shared/services/cines.service';

function salas(n: number): Sala[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    nombre: `Sala ${i + 1}`,
    filas: 10,
    columnas: 12,
  }));
}

const T = '2026-01-15T00:00:00Z';

/**
 * Cines mock por ciudad. Cada cine referencia el `id_ciudad` correspondiente
 * a `MOCK_CIUDADES`. La cantidad de salas es realista pero arbitraria.
 */
export const MOCK_CINES: Cine[] = [
  // ── Guatemala (id 1) ──────────────────────────────
  { id: 'gua-1', id_ciudad: '1', nombre: 'Cinépolis Oakland Mall', direccion: 'Diagonal 6 13-01, Zona 10', salas: salas(8), fecha_creacion: T },
  { id: 'gua-2', id_ciudad: '1', nombre: 'Cinépolis Miraflores', direccion: 'Calz. Roosevelt 21-30, Zona 11', salas: salas(10), fecha_creacion: T },
  { id: 'gua-3', id_ciudad: '1', nombre: 'Cines Pradera Concepción', direccion: 'Carr. a El Salvador Km 13', salas: salas(6), fecha_creacion: T },

  // ── San Pedro Sula (id 2) ─────────────────────────
  { id: 'sps-1', id_ciudad: '2', nombre: 'Cinépolis City Mall', direccion: 'Bulevar del Sur', salas: salas(8), fecha_creacion: T },
  { id: 'sps-2', id_ciudad: '2', nombre: 'Cines Plaza del Sol', direccion: 'Av. Circunvalación, sector 6', salas: salas(5), fecha_creacion: T },

  // ── Tegucigalpa (id 3) ────────────────────────────
  { id: 'tgu-1', id_ciudad: '3', nombre: 'Multiplaza', direccion: 'Boulevard Morazán', salas: salas(6), fecha_creacion: T },
  { id: 'tgu-2', id_ciudad: '3', nombre: 'Mall Galerías', direccion: 'Lomas del Mayab', salas: salas(5), fecha_creacion: T },
  { id: 'tgu-3', id_ciudad: '3', nombre: 'Cinemark Las Cascadas', direccion: 'Boulevard Centroamérica', salas: salas(7), fecha_creacion: T },

  // ── Santa Ana (id 4) ──────────────────────────────
  { id: 'sta-1', id_ciudad: '4', nombre: 'Cines Metrocentro Santa Ana', direccion: 'Final 25 Av. Sur', salas: salas(4), fecha_creacion: T },

  // ── San Salvador (id 5) ───────────────────────────
  { id: 'ssv-1', id_ciudad: '5', nombre: 'Multiplaza San Salvador', direccion: 'Centro Comercial Multiplaza', salas: salas(8), fecha_creacion: T },
  { id: 'ssv-2', id_ciudad: '5', nombre: 'Galerías Escalón', direccion: 'Paseo General Escalón', salas: salas(6), fecha_creacion: T },

  // ── El Progreso (id 6) ────────────────────────────
  { id: 'pro-1', id_ciudad: '6', nombre: 'City Mall El Progreso', direccion: 'Boulevard de los Próceres', salas: salas(4), fecha_creacion: T },

  // ── Choloma (id 7) ────────────────────────────────
  { id: 'cho-1', id_ciudad: '7', nombre: 'Pacific Mall Choloma', direccion: 'Bulevar Principal', salas: salas(3), fecha_creacion: T },

  // ── Quetzaltenango (id 8) ─────────────────────────
  { id: 'xel-1', id_ciudad: '8', nombre: 'Cinépolis Pradera Xela', direccion: 'Calzada Veterinaria, Zona 9', salas: salas(5), fecha_creacion: T },

  // ── La Ceiba (id 9) ───────────────────────────────
  { id: 'lce-1', id_ciudad: '9', nombre: 'Megaplaza La Ceiba', direccion: 'Avenida San Isidro', salas: salas(4), fecha_creacion: T },

  // ── Comayagua (id 10) ─────────────────────────────
  { id: 'cma-1', id_ciudad: '10', nombre: 'Hipermall Comayagua', direccion: 'Boulevard Sur', salas: salas(3), fecha_creacion: T },
];
