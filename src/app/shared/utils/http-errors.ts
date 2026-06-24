import { HttpErrorResponse } from '@angular/common/http';

const FALLBACK = 'Ocurrió un error inesperado';

/**
 * Pulls a user-facing message out of any error thrown by HttpClient.
 * Backend (NestJS) returns `{ message: string | string[], statusCode, error }`
 * via the default ValidationPipe + HttpException flow.
 */
export function extractMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      const m = (body as { message?: unknown }).message;
      if (Array.isArray(m) && m.length) return String(m[0]);
      if (typeof m === 'string' && m.trim()) return m;
    }
    if (typeof body === 'string' && body.trim()) return body;
    if (err.statusText && err.status !== 0) return `${err.status} ${err.statusText}`;
    if (err.status === 0) return 'No se pudo conectar al servidor';
    return FALLBACK;
  }
  if (err instanceof Error && err.message) return err.message;
  return FALLBACK;
}
