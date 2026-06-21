import { Observable } from 'rxjs';

export type RolStaff = 'admin' | 'recepcionista';

export type UsuarioStaff = {
  id: string;
  nombre: string;
  email: string;
  rol: RolStaff;
  /** ids de cines asignados. Vacío en admin = acceso a todos los cines. */
  cines: string[];
  ultimoAcceso: string | null;
  activo: boolean;
  created_at: string;
};

export type CrearUsuarioInput = {
  nombre: string;
  email: string;
  rol: RolStaff;
  cines: string[];
};

export type EditarUsuarioInput = Partial<CrearUsuarioInput>;

export abstract class UsuariosService {
  abstract list(): Observable<UsuarioStaff[]>;
  abstract create(input: CrearUsuarioInput): Observable<UsuarioStaff>;
  abstract update(id: string, input: EditarUsuarioInput): Observable<UsuarioStaff>;
  abstract setActivo(id: string, activo: boolean): Observable<UsuarioStaff>;
  abstract resetPassword(id: string): Observable<{ tempPassword: string }>;
}
