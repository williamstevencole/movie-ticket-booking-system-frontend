import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type MiPerfil = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  notificaciones_activas: boolean;
  estado: string;
  created_at: string;
};

export type ActualizarMiPerfilInput = {
  nombre?: string;
  telefono?: string;
  notificaciones_activas?: boolean;
};

export type ActualizarPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);

  obtenerMiPerfil(): Observable<MiPerfil> {
    return this.http.get<MiPerfil>(`${API_URL}/me/perfil`);
  }

  actualizarMiPerfil(input: ActualizarMiPerfilInput): Observable<MiPerfil> {
    return this.http.patch<MiPerfil>(`${API_URL}/me/perfil`, input);
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

  eliminarMiCuenta(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/me/cuenta`);
  }
}
