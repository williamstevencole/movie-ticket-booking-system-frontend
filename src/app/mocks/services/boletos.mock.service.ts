/**
 * MockBoletosService — kept for reference / possible future test use.
 * No longer registered as a provider (BoletosService abstract class removed in Task 11).
 * Components now use MisReservasService directly.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs';

import { Boleto } from '../../shared/services/mis-reservas.service';
import { MOCK_RESERVAS } from '../data/reservas.mock';
import { MOCK_FUNCIONES } from '../data/funciones.mock';
import { MOCK_PELICULAS } from '../data/peliculas.mock';
import { MOCK_CINES } from '../data/cines.mock';
import { MOCK_PAGOS } from '../data/pagos.mock';

@Injectable()
export class MockBoletosService {
  list(): Observable<Boleto[]> {
    return of(this.buildAll());
  }

  getByNumeroReserva(numero: string): Observable<Boleto | undefined> {
    return this.list().pipe(map((all) => all.find((b) => b.numero_reserva === numero)));
  }

  private buildAll(): Boleto[] {
    const boletos: Boleto[] = [];
    for (const r of MOCK_RESERVAS) {
      const funcion = MOCK_FUNCIONES.find((f) => f.id === r.id_funcion);
      if (!funcion) continue;
      const pelicula = MOCK_PELICULAS.find((p) => p.id === funcion.id_pelicula);
      const cine = MOCK_CINES.find((c) => c.id === funcion.id_cine);
      if (!pelicula || !cine) continue;

      const salaIdSuffix = funcion.id_sala.split('-s').pop() ?? funcion.id_sala;
      const sala = cine.salas.find((s) => s.id === salaIdSuffix) ?? {
        id: salaIdSuffix,
        nombre: `Sala ${salaIdSuffix}`,
        filas: 0,
        columnas: 0,
      };

      const pago = MOCK_PAGOS.find(
        (p) => p.id_reserva === r.id && (p.estado === 'exitoso' || p.estado === 'reembolsado'),
      );

      boletos.push({
        id: r.id,
        numero_reserva: r.numero_reserva,
        estado: r.estado,
        created_at: r.created_at,
        id_funcion: r.id_funcion,
        fecha_hora: funcion.fecha_hora,
        pelicula: {
          id: pelicula.id,
          titulo: pelicula.titulo,
          poster_url: pelicula.poster_url,
        },
        sala: { id: sala.id, nombre: sala.nombre },
        cine: { id: cine.id, nombre: cine.nombre },
        asientos: r.asientos ?? [],
        monto_total: pago?.monto_final ?? r.monto_total,
        ultimos4_snapshot: pago?.ultimos4_snapshot ?? null,
        marca_snapshot: pago?.marca_snapshot ?? null,
      });
    }
    return boletos;
  }
}
