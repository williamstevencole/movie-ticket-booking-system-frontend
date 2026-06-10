import { HttpParams } from '@angular/common/http';

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

/** Convierte un objeto simple en HttpParams ignorando undefined / null. */
export function toHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();
  if (!params) return httpParams;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}
