import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  AuditLogDetail,
  AuditLogListResponse,
  AuditLogQuery,
} from './bitacora.types';
import { BITACORA_MOCK } from './mocks/bitacora.mock';

const MOCK_DETAILS: Record<string, AuditLogDetail> = {};
BITACORA_MOCK.forEach((item) => {
  MOCK_DETAILS[item.id] = {
    id: item.id,
    created_at: item.created_at,
    accion: item.accion,
    detalle: item.detalle,
    entidad: item.entidad,
    entidad_id: item.entidad_id,
    auditor: item.auditor,
    valor_anterior: item.tiene_snapshot ? { estado: 'anterior' } : null,
    valor_nuevo: item.tiene_snapshot ? { estado: 'nuevo' } : null,
  };
});

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  list(q: AuditLogQuery): Observable<AuditLogListResponse> {
    let items = [...BITACORA_MOCK];
    if (q.accion?.length) items = items.filter((i) => q.accion!.includes(i.accion));
    if (q.entidad) items = items.filter((i) => i.entidad === q.entidad);
    if (q.entidad_id) items = items.filter((i) => i.entidad_id === q.entidad_id);
    if (q.id_auditor) items = items.filter((i) => i.auditor.id === q.id_auditor);
    if (q.fecha_desde) items = items.filter((i) => i.created_at >= q.fecha_desde!);
    if (q.fecha_hasta) items = items.filter((i) => i.created_at <= q.fecha_hasta!);
    const page = q.page ?? 1;
    const page_size = q.page_size ?? 20;
    const start = (page - 1) * page_size;
    const response: AuditLogListResponse = {
      items: items.slice(start, start + page_size),
      total: items.length,
      page,
      page_size,
    };
    return of(response).pipe(delay(120));
  }

  getById(id: string): Observable<AuditLogDetail> {
    const found = MOCK_DETAILS[id] ?? {
      ...BITACORA_MOCK[0]!,
      valor_anterior: null,
      valor_nuevo: null,
    };
    return of({ ...found }).pipe(delay(120));
  }
}
