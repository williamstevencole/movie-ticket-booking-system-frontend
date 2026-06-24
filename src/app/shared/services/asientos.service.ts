import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TipoAsiento } from '../../features/asientos/mapa/seat-types/seat-type.model';
import { EstadoAsiento } from '../../features/asientos/mapa/seat-states/seat-state.model';

export type AsientoFuncion = {
  id: string;
  fila: string;
  numero: number;
  tipo: TipoAsiento;
  estado: EstadoAsiento;
  bloqueado_hasta?: string;
  version: number;
  precio?: number;
};

export type MapaAsientos = {
  id_funcion: string;
  expira_en?: string;
  asientos: AsientoFuncion[];
};

// Generates an 80-seat mock map (rows A-H, columns 1-10)
function buildMockMapa(idFuncion: string): MapaAsientos {
  const FILAS = 'ABCDEFGH';
  const COLUMNAS = 10;

  // Occupation pattern: ~30% ocupado, 5% reservado, rest disponible
  // VIP: last 2 rows (G, H), accesible: col 1 in any row
  const asientos: AsientoFuncion[] = [];

  for (let fi = 0; fi < FILAS.length; fi++) {
    const fila = FILAS[fi]!;
    const isVipRow = fi >= 6; // G, H are VIP
    for (let col = 1; col <= COLUMNAS; col++) {
      const idx = fi * COLUMNAS + col;
      const tipo: TipoAsiento = col === 1 ? 'accesible' : isVipRow ? 'vip' : 'estandar';

      // Deterministic occupation: seed based on funcion id hash + position
      let seed = 0;
      for (let k = 0; k < idFuncion.length; k++) seed = (seed * 31 + idFuncion.charCodeAt(k)) % 1000;
      const val = (seed + idx * 7) % 10;
      let estado: EstadoAsiento;
      if (val < 3) {
        estado = 'ocupado';
      } else if (val === 3) {
        estado = 'reservado';
      } else {
        estado = 'disponible';
      }

      const precio = tipo === 'vip' ? 165 : tipo === 'accesible' ? 75 : 85;

      asientos.push({
        id: `af-${idFuncion}-${fila}${col}`,
        fila,
        numero: col,
        tipo,
        estado,
        version: 1,
        precio,
      });
    }
  }

  return {
    id_funcion: String(idFuncion),
    asientos,
  };
}

@Injectable({ providedIn: 'root' })
export class AsientosService {
  mapa(idFuncion: string | number) {
    return of(buildMockMapa(String(idFuncion))).pipe(delay(120));
  }

  bloquear(idFuncion: string | number, ids: (string | number)[]) {
    const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return of({ expira_en: expira }).pipe(delay(120));
  }
}
