import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { toStr } from '../../core/api/normalize';

/** Horario individual (una función) listo para mostrar. */
export type HorarioVM = {
  funcionId: string;
  fechaHora: string;
  /** "HH:mm" en hora local. */
  hora: string;
  /** "YYYY-MM-DD" en hora local, para filtrar por día. */
  dia: string;
  estado: string;
  /** Disponibilidad — la rellena la Card 4 (funciones por cine). */
  asientosLibres?: number;
  capacidad?: number;
};

export type SalaVM = {
  id: string;
  nombre: string;
  horarios: HorarioVM[];
};

export type CineFuncionesVM = {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string;
  /** Inicial para el avatar del cine. */
  iconLetter: string;
  salas: SalaVM[];
};

type BackendFuncion = { id: string | number; fecha_hora: string; estado: string };
type BackendSala = { id: string | number; nombre: string; funciones: BackendFuncion[] };
type BackendCine = {
  id: string | number;
  nombre: string;
  direccion: string | null;
  id_ciudad: string | number;
  ciudades: { id: string | number; nombre: string };
  salas: BackendSala[];
};

type BackendAsientos = {
  total: number;
  disponibles: number;
  bloqueados: number;
  reservados: number;
  ocupados: number;
};
type BackendFuncionConDisp = {
  id: string | number;
  fecha_hora: string;
  estado: string;
  sala: { id: string | number; nombre: string };
  asientos: BackendAsientos;
};
type BackendFuncionesPorCine = {
  pelicula: { id: string | number; titulo: string };
  cine: { id: string | number; nombre: string };
  funciones: BackendFuncionConDisp[];
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toHora(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDia(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Servicio de cara al cliente para las funciones de una película por cine.
 * Card 3 usa `cines()`; la Card 4 añadirá la disponibilidad de asientos.
 */
@Injectable({ providedIn: 'root' })
export class PeliculaCinesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/peliculas`;

  /** Cines con funciones activas para una película (GET /peliculas/:id/cines). */
  cines(peliculaId: string): Observable<CineFuncionesVM[]> {
    return this.http
      .get<BackendCine[]>(`${this.base}/${peliculaId}/cines`)
      .pipe(map((cines) => cines.map((c) => this.mapCine(c))));
  }

  /**
   * Funciones de una película en un cine, con disponibilidad de asientos
   * (GET /peliculas/:id/cines/:cineId/funciones). Devuelve las salas agrupadas.
   */
  funciones(peliculaId: string, cineId: string): Observable<SalaVM[]> {
    return this.http
      .get<BackendFuncionesPorCine>(`${this.base}/${peliculaId}/cines/${cineId}/funciones`)
      .pipe(map((res) => this.groupBySala(res.funciones ?? [])));
  }

  private groupBySala(funciones: BackendFuncionConDisp[]): SalaVM[] {
    const salas = new Map<string, SalaVM>();
    for (const f of funciones) {
      const salaId = toStr(f.sala.id);
      let sala = salas.get(salaId);
      if (!sala) {
        sala = { id: salaId, nombre: f.sala.nombre, horarios: [] };
        salas.set(salaId, sala);
      }
      sala.horarios.push({
        funcionId: toStr(f.id),
        fechaHora: f.fecha_hora,
        hora: toHora(f.fecha_hora),
        dia: toDia(f.fecha_hora),
        estado: f.estado,
        asientosLibres: f.asientos?.disponibles ?? 0,
        capacidad: f.asientos?.total ?? 0,
      });
    }
    return [...salas.values()];
  }

  private mapCine(c: BackendCine): CineFuncionesVM {
    const nombre = c.nombre ?? '';
    return {
      id: toStr(c.id),
      nombre,
      direccion: c.direccion ?? null,
      ciudad: c.ciudades?.nombre ?? '',
      iconLetter: nombre.trim().charAt(0).toUpperCase() || '?',
      salas: (c.salas ?? []).map((s) => ({
        id: toStr(s.id),
        nombre: s.nombre,
        horarios: (s.funciones ?? []).map((f) => ({
          funcionId: toStr(f.id),
          fechaHora: f.fecha_hora,
          hora: toHora(f.fecha_hora),
          dia: toDia(f.fecha_hora),
          estado: f.estado,
        })),
      })),
    };
  }
}
