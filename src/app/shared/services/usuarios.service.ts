import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL } from '../../core/config/env';
import { toStr } from '../../core/api/normalize';

export type RolStaff = 'admin' | 'cliente';

export type UsuarioStaff = {
  id: string;
  nombre: string;
  email: string;
  rol: RolStaff;
  notificaciones_activas: boolean;
  ultimo_acceso: string | null;
  activo: boolean;
  created_at: string;
};

export type CrearUsuarioInput = {
  nombre: string;
  email: string;
  rol: RolStaff;
  password?: string;
};

export type EditarUsuarioInput = Partial<
  Pick<CrearUsuarioInput, 'nombre' | 'email' | 'rol'>
>;

export type ActualizarMiPerfilInput = {
  nombre?: string;
  telefono?: string;
  notificaciones_activas?: boolean;
};

export type ActualizarPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ToggleNotificacionesResponse = {
  notificaciones_activas: boolean;
};

type BackendUsuario = {
  id: string | number;
  nombre: string;
  email: string;
  rol: RolStaff;
  notificaciones_activas: boolean;
  ultimo_acceso: string | null;
  activo: boolean;
  created_at: string;
};

function mapBackendUsuario(u: BackendUsuario): UsuarioStaff {
  return {
    id: toStr(u.id),
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    notificaciones_activas: u.notificaciones_activas,
    ultimo_acceso: u.ultimo_acceso,
    activo: u.activo,
    created_at: u.created_at,
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);

  private readonly base = `${API_URL}/admin/staff`;

  list(): Observable<UsuarioStaff[]> {
    return this.http
      .get<BackendUsuario[]>(this.base)
      .pipe(map((users) => users.map(mapBackendUsuario)));
  }

  create(input: CrearUsuarioInput): Observable<UsuarioStaff> {
    return this.http
      .post<BackendUsuario>(this.base, input)
      .pipe(map(mapBackendUsuario));
  }

  update(id: string, input: EditarUsuarioInput): Observable<UsuarioStaff> {
    return this.http
      .patch<BackendUsuario>(`${this.base}/${id}`, input)
      .pipe(map(mapBackendUsuario));
  }

  setActivo(id: string, activo: boolean): Observable<UsuarioStaff> {
    return this.http
      .patch<BackendUsuario>(`${this.base}/${id}/estado`, {
        activo,
      })
      .pipe(map(mapBackendUsuario));
  }

  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return this.http.post<{ tempPassword: string }>(
      `${this.base}/${id}/reset-password`,
      {},
    );
  }

  actualizarMiPerfil(input: ActualizarMiPerfilInput): Observable<UsuarioStaff> {
    return this.http
      .patch<BackendUsuario>(`${API_URL}/me/perfil`, input)
      .pipe(map(mapBackendUsuario));
  }

  actualizarPassword(
    id: string,
    input: ActualizarPasswordInput,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${API_URL}/admin/users/${id}/password`,
      input,
    );
  }

  toggleNotificaciones(
    id: string,
  ): Observable<ToggleNotificacionesResponse> {
    return this.http.patch<ToggleNotificacionesResponse>(
      `${API_URL}/admin/users/${id}/notificaciones`,
      {},
    );
  }
}
