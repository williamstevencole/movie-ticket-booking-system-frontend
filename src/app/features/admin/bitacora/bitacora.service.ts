import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BITACORA_MOCK } from './mocks/bitacora.mock';
import { SNAPSHOTS_BY_EVENT_ID } from './mocks/snapshots.mock';
import {
  AuditLogDetail,
  AuditLogListResponse,
  AuditLogQuery,
} from './bitacora.types';

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  list(q: AuditLogQuery): Observable<AuditLogListResponse> {
    let items = [...BITACORA_MOCK];
    if (q.accion?.length) items = items.filter((i) => q.accion!.includes(i.accion));
    if (q.entidad) items = items.filter((i) => i.entidad === q.entidad);
    if (q.entidad_id) items = items.filter((i) => i.entidad_id === q.entidad_id);
    if (q.id_auditor) items = items.filter((i) => i.auditor.id === q.id_auditor);
    if (q.fecha_desde) items = items.filter((i) => i.created_at >= q.fecha_desde!);
    if (q.fecha_hasta)
      items = items.filter((i) => i.created_at <= q.fecha_hasta! + 'T23:59:59.999Z');
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const page = q.page ?? 1;
    const page_size = q.page_size ?? 20;
    const total = items.length;
    const slice = items.slice((page - 1) * page_size, page * page_size);

    return of({ items: slice, total, page, page_size }).pipe(delay(150));
  }

  getById(id: string): Observable<AuditLogDetail> {
    const item = BITACORA_MOCK.find((i) => i.id === id);
    if (!item) throw new Error(`No encontrado: ${id}`);
    const snap = SNAPSHOTS_BY_EVENT_ID[id] ?? { valor_anterior: null, valor_nuevo: null };
    const { tiene_snapshot: _tiene, ...rest } = item;
    return of({
      ...rest,
      valor_anterior: snap.valor_anterior,
      valor_nuevo: snap.valor_nuevo,
    } as AuditLogDetail).pipe(delay(100));
  }
}
