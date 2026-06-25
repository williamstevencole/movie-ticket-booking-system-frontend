/**
 * Normalization helpers for backend response shapes.
 *
 * The backend (NestJS + Prisma) serializes Prisma's BigInt ids inconsistently:
 * sometimes as numbers (small ids), sometimes as strings (when crossing the
 * 2^53 boundary). The frontend wants string ids everywhere for stable Map keys
 * and URL routing.
 *
 * These helpers are the only place that coercion happens. Every `mapBackendX`
 * in `shared/services/*.service.ts` calls them — no inline `String(...)`.
 */

export function toStr(v: string | number): string {
  return String(v);
}

export function toStrOrNull(v: string | number | null | undefined): string | null {
  if (v == null) return null;
  return String(v);
}

export function toNum(v: string | number): number {
  return typeof v === 'number' ? v : Number(v);
}

export function toNumOrNull(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  return typeof v === 'number' ? v : Number(v);
}
