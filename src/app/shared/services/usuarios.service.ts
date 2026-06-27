import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type RolStaff = 'admin' | 'cliente';

export type UsuarioStaff = {
  id: string;
  nombre: string;
  email: string;
  rol: RolStaff;
  ultimoAcceso: string | null;
  activo: boolean;
  created_at: string;
};

export type CrearUsuarioInput = {
  nombre: string;
  email: string;
  password?: string;
};

export type EditarUsuarioInput = Partial<Pick<CrearUsuarioInput, 'nombre' | 'email'>>;

// Private: raw shape returned by GET /admin/staff list rows
type BackendStaffRow = {
  id: string;
  nombre: string;
  email: string;
  estado: 'activo' | 'bloqueado';
  ultimo_acceso: string | null;
  created_at: string;
};

function mapBackendStaff(r: BackendStaffRow): UsuarioStaff {
  return {
    id: r.id,
    nombre: r.nombre,
    email: r.email,
    rol: 'admin',                          // all /admin/staff results are admins by definition
    ultimoAcceso: r.ultimo_acceso ?? null, // snake_case → camelCase rename
    activo: r.estado === 'activo',         // derive boolean from estado string
    created_at: r.created_at,
  };
}

/** Staff / admin user management service — maps to /api/admin/staff/* */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/staff`;

  list(): Observable<UsuarioStaff[]> {
    return this.http
      .get<{ data: BackendStaffRow[]; total: number; page: number; limit: number } | BackendStaffRow[]>(this.base)
      .pipe(
        map((res) => (Array.isArray(res) ? res : res.data)),
        map((arr) => arr.map(mapBackendStaff)),
      );
  }

  create(input: CrearUsuarioInput): Observable<UsuarioStaff> {
    return this.http
      .post<{ user: BackendStaffRow; tempPassword?: string }>(this.base, input)
      .pipe(map((res) => mapBackendStaff(res.user)));
  }

  update(id: string, input: EditarUsuarioInput): Observable<UsuarioStaff> {
    return this.http
      .patch<BackendStaffRow>(`${this.base}/${id}`, input)
      .pipe(map(mapBackendStaff));
  }

  setActivo(id: string, activo: boolean): Observable<UsuarioStaff> {
    return this.http
      .patch<BackendStaffRow>(
        `${this.base}/${id}/estado`,
        { estado: activo ? 'activo' : 'bloqueado' },
      )
      .pipe(map(mapBackendStaff));
  }

  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return this.http.post<{ tempPassword: string }>(`${this.base}/${id}/reset-password`, {});
  }

  // NOTE: actualizarMiPerfil() removed — was a @deprecated shim.
  // Consumers now use PerfilService.actualizarMiPerfil() directly.
}
