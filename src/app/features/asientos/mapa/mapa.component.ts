import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PanelLateralComponent } from '../panel-lateral/panel-lateral.component';
import { Asiento, EstadoAsiento } from './seat-types/asiento.model';

//logica cambia despues

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [PanelLateralComponent],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent {
  readonly funcionId = signal<string | null>(null);

  readonly filas = signal<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

  readonly asientos = signal<Asiento[]>(this.crearAsientos());

  readonly asientosSeleccionados = computed(() =>
    this.asientos().filter((asiento) => asiento.estado === 'seleccionado'),
  );

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
        } else {
          estado = 'ocupado';
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

  toggleAsiento(asiento: Asiento) {
    if (asiento.estado === 'ocupado') {
      return;
    }

    this.asientos.update((lista) =>
      lista.map((a) =>
        a.id === asiento.id
          ? {
              ...a,
              estado:
                a.estado === 'seleccionado' ? 'disponible' : 'seleccionado',
            }
          : a,
      ),
    );
  }
}
