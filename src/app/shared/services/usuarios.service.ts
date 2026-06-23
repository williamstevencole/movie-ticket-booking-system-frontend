import { Observable } from 'rxjs';

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
};

export type EditarUsuarioInput = Partial<CrearUsuarioInput>;

export type ActualizarMiPerfilInput = {
  nombre?: string;
  telefono?: string;
  notificaciones_activas?: boolean;
};

export abstract class UsuariosService {
  abstract list(): Observable<UsuarioStaff[]>;
  abstract create(input: CrearUsuarioInput): Observable<UsuarioStaff>;
  abstract update(id: string, input: EditarUsuarioInput): Observable<UsuarioStaff>;
  abstract setActivo(id: string, activo: boolean): Observable<UsuarioStaff>;
  abstract resetPassword(id: string): Observable<{ tempPassword: string }>;
  abstract actualizarMiPerfil(input: ActualizarMiPerfilInput): Observable<UsuarioStaff>;
}
