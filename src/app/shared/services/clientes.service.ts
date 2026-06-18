import { Observable } from 'rxjs';

// Espejo de Usuarios (rol = cliente) en api/prisma/schema.prisma
export type EstadoCliente = 'activo' | 'bloqueado';

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: EstadoCliente;
  notificaciones_activas: boolean;
  id_ciudad: string | null;
  num_reservas: number;
  created_at: string;
};

export abstract class ClientesService {
  abstract list(): Observable<Cliente[]>;
  abstract getById(id: string): Observable<Cliente | undefined>;
  abstract toggleEstado(id: string): Observable<Cliente>;
}
