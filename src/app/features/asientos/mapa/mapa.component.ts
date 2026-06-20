import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PanelLateralComponent } from '../panel-lateral/panel-lateral.component';
import { Asiento } from './asiento.model';
import { ErrorComponent } from '../error/error.component';
import { TipoAsiento } from './seat-types/seat-type.model';

//logica cambia despues

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [PanelLateralComponent, ErrorComponent],
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

  readonly mapaActualizado = signal(false);

  //---------------------simulando el error de conflicto ya con la actualizacion de mapa
  readonly mostrarError = signal(false);
  readonly asientoConflicto = signal('');

  constructor(private route: ActivatedRoute) {
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

        let tipo: TipoAsiento = 'estandar';

        if (fila === 'A' || fila === 'B') {
          tipo = 'vip';
        }

        if (fila === 'H') {
          tipo = 'accesible';
        }

        let estado: EstadoAsiento;

        if (rand < 0.5) {
          estado = 'disponible';
        } else {
          estado = 'ocupado';
        }

        if (fila === 'D' && numero <= 3) {
          estado = 'bloqueado';
        }

        resultado.push({
          id: `${fila}-${numero}`,

          fila,

          numero,

          tipo,

          estado,
        });
      }
    }

    return resultado;
  }

  toggleAsiento(asiento: Asiento) {
    if (asiento.estado === 'ocupado' || asiento.estado === 'bloqueado') {
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

  actualizarMapa(asientosActualizados: Asiento[]) {
    this.asientos.set(asientosActualizados);
  }

  readonly salaBloqueada = computed(() =>
    this.asientos().every((asiento) => asiento.estado === 'bloqueado'),
  );
  
  //---------------------------------------testing testing para mapa refresh
  simularCambio() {
    const nuevosAsientos: Asiento[] = this.asientos().map((asiento) => {
      if (asiento.id === 'B-3') {
        return this.cambiarEstado(asiento, 'ocupado');
      }

      return asiento;
    });

    this.asientoConflicto.set('B-3');
    this.mostrarError.set(true);

    this.actualizarMapa(nuevosAsientos);

    setTimeout(() => {
      this.mostrarError.set(false);
    }, 4000);
  }

  private cambiarEstado(asiento: Asiento, estado: EstadoAsiento): Asiento {
    return {
      ...asiento,
      estado,
    };
  }
}
import { EstadoAsiento } from './seat-states/seat-state.model';
