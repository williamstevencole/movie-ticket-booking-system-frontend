/**
 * Re-export shim — ReembolsosService split into:
 *   - MisReembolsosService (cliente) — see mis-reembolsos.service.ts
 *   - AdminReembolsosService (admin) — see admin-reembolsos.service.ts
 *
 * Kept as a shim in Task 13 so any remaining type-only imports don't break.
 */
export type { MiReembolso as Reembolso } from './mis-reembolsos.service';
export type { EstadoReembolsoAdmin, MetodoReembolso, ReembolsoAdmin, AdminReembolsoRow } from './admin-reembolsos.service';
