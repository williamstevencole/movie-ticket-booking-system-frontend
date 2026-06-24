import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_USUARIOS } from '../../mocks/data/usuarios.mock';

export type RolStaff = 'admin' | 'cliente';

export type UsuarioStaff = {
  id: string;
  nombre: string;
  email: string;
  rol: RolStaff;
  notificaciones_activas: boolean;
  ultimoAcceso: string | null;
  activo: boolean;
  created_at: string;
};

export type CrearUsuarioInput = {
  nombre: string;
  email: string;
  rol: RolStaff;
  password?: string;
};

export type EditarUsuarioInput = Partial<Pick<CrearUsuarioInput, 'nombre' | 'email' | 'rol'>>;

export type ActualizarMiPerfilInput = {
  nombre?: string;
  telefono?: string;
  notificaciones_activas?: boolean;
};

/** Staff / admin user management service — maps to /api/admin/staff/* */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  list(): Observable<UsuarioStaff[]> {
    return of([...MOCK_USUARIOS]).pipe(delay(120));
  }

  create(input: CrearUsuarioInput): Observable<UsuarioStaff> {
    const nuevo: UsuarioStaff = {
      id: `usr-${Date.now()}`,
      nombre: input.nombre,
      email: input.email,
      rol: input.rol,
      notificaciones_activas: false,
      ultimoAcceso: null,
      activo: true,
      created_at: new Date().toISOString(),
    };
    return of({ ...nuevo }).pipe(delay(120));
  }

  update(id: string, input: EditarUsuarioInput): Observable<UsuarioStaff> {
    const found = MOCK_USUARIOS.find((u) => u.id === id) ?? MOCK_USUARIOS[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  setActivo(id: string, activo: boolean): Observable<UsuarioStaff> {
    const found = MOCK_USUARIOS.find((u) => u.id === id) ?? MOCK_USUARIOS[0]!;
    return of({ ...found, activo }).pipe(delay(120));
  }

  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return of({ tempPassword: 'Temp@1234' }).pipe(delay(120));
  }

  /**
   * @deprecated Use PerfilService.actualizarMiPerfil() instead.
   * Kept as shim for backward compatibility with perfil.component.ts.
   */
  actualizarMiPerfil(input: ActualizarMiPerfilInput): Observable<UsuarioStaff> {
    const base = MOCK_USUARIOS[0]!;
    return of({ ...base, ...input } as UsuarioStaff).pipe(delay(120));
  }
}
