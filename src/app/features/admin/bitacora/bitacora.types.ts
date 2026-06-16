export interface AuditLogItem {
  id: string;
  created_at: string;
  accion: string;
  detalle: string | null;
  entidad: string | null;
  entidad_id: string | null;
  auditor: { id: string; nombre: string; email: string };
  tiene_snapshot: boolean;
}

export interface AuditLogDetail extends Omit<AuditLogItem, 'tiene_snapshot'> {
  valor_anterior: Record<string, unknown> | null;
  valor_nuevo: Record<string, unknown> | null;
}

export interface AuditLogListResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogQuery {
  page?: number;
  page_size?: number;
  accion?: string[];
  entidad?: string;
  entidad_id?: string;
  id_auditor?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}
