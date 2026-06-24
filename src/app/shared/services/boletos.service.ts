/**
 * Re-export shim — Boleto type moved to mis-reservas.service.ts in Task 11.
 * Kept for backward compatibility of existing type-only imports.
 * BoletosService abstract class removed (all consumers switched to MisReservasService).
 */
export type { Boleto } from './mis-reservas.service';
