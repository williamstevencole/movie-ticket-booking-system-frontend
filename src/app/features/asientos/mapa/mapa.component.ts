import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

//logica cambia despues

type EstadoAsiento = 'disponible' | 'ocupado' | 'seleccionado';

interface Asiento {
  id: string;
  fila: string;
  numero: number;
  estado: EstadoAsiento;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent {
  readonly funcionId = signal<string | null>(null);

  readonly filas = signal<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

  readonly asientos = signal<Asiento[]>(this.crearAsientos());

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.funcionId.set(this.route.snapshot.paramMap.get('id'));
  }

  asientosPorFila(fila: string) {
    return this.asientos().filter((asiento) => asiento.fila === fila);
  }

  private crearAsientos(): Asiento[] {
    const resultado: Asiento[] = [];

    for (const fila of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      for (let numero = 1; numero <= 10; numero++) {
        const rand = Math.random();
        let estado: EstadoAsiento;

        if (rand < 0.5) {
          estado = 'disponible';
        } else if (rand < 0.8) {
          estado = 'ocupado';
        } else {
          estado = 'seleccionado';
        }

        resultado.push({
          id: `${fila}-${numero}`,
          fila,
          numero,
          estado,
        });
      }
    }

    return resultado;
  }

  volver() {
    this.location.back();
}
}
