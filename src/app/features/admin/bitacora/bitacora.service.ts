import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/env';
import {
  AuditLogDetail,
  AuditLogListResponse,
  AuditLogQuery,
} from './bitacora.types';

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/audit-log`;

  list(q: AuditLogQuery = {}): Observable<AuditLogListResponse> {
    let params = new HttpParams();

    if (q.page) params = params.set('page', String(q.page));
    if (q.page_size) params = params.set('page_size', String(q.page_size));
    if (q.entidad) params = params.set('entidad', q.entidad);
    if (q.entidad_id) params = params.set('entidad_id', q.entidad_id);
    if (q.id_auditor) params = params.set('id_auditor', q.id_auditor);
    if (q.fecha_desde) params = params.set('fecha_desde', q.fecha_desde);
    if (q.fecha_hasta) params = params.set('fecha_hasta', q.fecha_hasta);
    // accion is an array — send as repeated params: accion=X&accion=Y
    if (q.accion?.length) {
      for (const a of q.accion) {
        params = params.append('accion', a);
      }
    }

    return this.http.get<AuditLogListResponse>(this.base, { params });
  }

  getById(id: string): Observable<AuditLogDetail> {
    return this.http.get<AuditLogDetail>(`${this.base}/${id}`);
  }
}
