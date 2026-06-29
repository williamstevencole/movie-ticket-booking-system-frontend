import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PanelLateralComponent } from '../panel-lateral/panel-lateral.component';
import { ErrorComponent } from '../error/error.component';
import { TipoAsiento } from './seat-types/seat-type.model';
import { FuncionBarComponent } from '../funcion-bar/funcion-bar.component';
import { TimerComponent } from '../timer/timer.component';
import { CtaComponent } from '../cta/cta.component';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import {
  AsientosService,
  AsientoFuncion,
} from '../../../shared/services/asientos.service';
import { CheckoutStateService } from '../../checkout/checkout-state.service';
import { ToastService } from '../../../shared/services/toast.service';

// Minimal shape passed into the template seat grid
type AsientoDisplay = {
  codigo: string;
  numero: number;
  estado: 'disponible' | 'ocupado' | 'bloqueado' | 'fuera_servicio';
  tipo: TipoAsiento;
};

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    PanelLateralComponent,
    ErrorComponent,
    FuncionBarComponent,
    TimerComponent,
    CtaComponent,
    AppbarComponent,
    FooterComponent,
  ],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly asientosSvc = inject(AsientosService);
  private readonly toastSvc = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly checkoutStateSvc = inject(CheckoutStateService);
  readonly cargando = signal(false);

  readonly funcionId = signal<string | null>(null);

  // --- funcion-bar signals (populated from API or defaults) ---
  readonly pelicula = signal<string>('');
  readonly cine = signal<string>('');
  readonly sala = signal<string>('');
  readonly fechaHora = signal<string>(new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString());
  readonly duracionMin = signal<number | null>(null);
  readonly idioma = signal<string | null>(null);
  readonly posterUrl = signal<string | null>(null);
  readonly cargoServicio = signal<number>(15);

  // Timer expiry driven by server response
  readonly expiraEn = signal<string | null>(null);
  readonly timerSegundos = computed(() => {
    const expira = this.expiraEn();
    if (!expira) return 600; // default 10 min
    const diff = Math.floor((new Date(expira).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  // --- seat data from API ---
  readonly asientosRaw = signal<AsientoFuncion[]>([]);

  /** Asientos seleccionados por el usuario (full objects) */
  readonly asientosSeleccionados = signal<AsientoFuncion[]>([]);

  /** Error de conflicto de asiento */
  readonly errorAsiento = signal<string | null>(null);

  /** Show conflict modal */
  readonly mostrarModalConflicto = signal(false);

  /** Adapter: transforms flat AsientoFuncion[] into row-grouped shape for template */
  readonly filas = computed(() => {
    const todos = this.asientosRaw();
    const letras = [...new Set(todos.map((a) => a.fila))].sort();
    return letras.map((letra) => ({
      letra,
      asientos: todos
        .filter((a) => a.fila === letra)
        .sort((a, b) => a.numero - b.numero)
        .map<AsientoDisplay>((a) => ({
          codigo: `${a.fila}-${a.numero}`,
          numero: a.numero,
          estado: a.estado === 'seleccionado' ? 'disponible' : (a.estado as AsientoDisplay['estado']),
          tipo: a.tipo,
        })),
    }));
  });

  readonly asientosSeleccionadosDetallados = computed(() =>
    this.asientosSeleccionados().map((a) => ({
      codigo: `${a.fila}-${a.numero}`,
      tipo: a.tipo,
      precio: this.precioPorTipo(a.tipo),
      version: a.version,
    })),
  );

  readonly total = computed(() => {
    const subtotal = this.asientosSeleccionadosDetallados().reduce(
      (sum, a) => sum + a.precio,
      0,
    );
    return subtotal + this.cargoServicio();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.funcionId.set(id);
    if (id) {
      this.cargarMapa(id, true);
      interval(5000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cargarMapa(id, false));
    }
  }

  estaSeleccionado(codigo: string): boolean {
    return this.asientosSeleccionados().some(
      (a) => `${a.fila}-${a.numero}` === codigo,
    );
  }

  toggle(asiento: AsientoDisplay): void {
    if (asiento.estado === 'fuera_servicio') return;
    if (asiento.estado === 'bloqueado') return;
    if (asiento.estado === 'ocupado') {
      this.errorAsiento.set(asiento.codigo);
      return;
    }
    const full = this.buscarAsientoCompleto(asiento.codigo);
    if (!full) return;

    const sel = this.asientosSeleccionados();
    const yaSeleccionado = sel.some((a) => `${a.fila}-${a.numero}` === asiento.codigo);

    if (yaSeleccionado) {
      const next = sel.filter((a) => `${a.fila}-${a.numero}` !== asiento.codigo);
      this.asientosSeleccionados.set(next);
      return;
    }

    // Selección optimista
    this.asientosSeleccionados.set([...sel, full]);

    // Si ya está bloqueado por mí (es_mio), no hace falta re-bloquear en el servidor.
    if (full.estado === 'seleccionado') return;

    const idFuncion = this.funcionId();
    if (!idFuncion) return;

    // Bloquear SOLO el asiento recién agregado (reenviar la lista completa
    // provocaría un 409 porque los ya seleccionados no están DISPONIBLE).
    this.asientosSvc.bloquear(idFuncion, [full.id]).subscribe({
      next: (res) => {
        if (res?.expira_en) this.expiraEn.set(res.expira_en);
      },
      error: (err) => {
        // Revertir solo este asiento
        this.asientosSeleccionados.set(
          this.asientosSeleccionados().filter((a) => a.id !== full.id),
        );
        if (err?.status === 409) {
          this.mostrarModalConflicto.set(true);
          this.cargarMapa(idFuncion, false);
        } else {
          this.toastSvc?.show?.('No se pudo bloquear el asiento. Intentá de nuevo.');
        }
      },
    });
  }

  onTimerExpirado(): void {
    this.asientosSeleccionados.set([]);
  }

  cerrarModalConflicto(): void {
    this.mostrarModalConflicto.set(false);
  }

  continuarAPago(): void {
    const funcionId = this.funcionId();
    const seleccionados = this.asientosSeleccionados();
    if (!funcionId || seleccionados.length === 0) return;

    this.cargando.set(true);

    this.checkoutStateSvc
      .confirmarReserva(funcionId, seleccionados)
      .subscribe({
        next: (reserva) => {
          this.cargando.set(false);
          this.checkoutStateSvc.setReservaPendiente(reserva);
          this.router.navigate(['/checkout/metodos-pago'], {
            queryParams: { reserva: reserva.id_reserva },
          });
        },
        error: (err) => {
          this.cargando.set(false);
          if (err?.code === 'SEAT_CONFLICT' || err?.status === 409) {
            this.mostrarModalConflicto.set(true);
            this.cargarMapa(funcionId, false);
          } else {
            this.toastSvc?.show?.('No se pudo crear la reserva. Intentá de nuevo.');
          }
        },
      });
  }

  private cargarMapa(idFuncion: string, initial: boolean): void {
    this.asientosSvc.mapa(idFuncion).subscribe({
      next: (res) => {
        this.asientosRaw.set(res.asientos);
        if (res.expira_en) this.expiraEn.set(res.expira_en);
      },
      error: (err) => {
        if (!initial) return;
        const msg =
          err?.status === 404
            ? `Función ${idFuncion} no encontrada.`
            : err?.status === 401
              ? 'Tu sesión expiró. Inicia sesión otra vez.'
              : `No se pudo cargar el mapa (${err?.status ?? 'red'}).`;
        this.toastSvc?.show?.(msg);
        this.errorAsiento.set(msg);
      },
    });
  }

  private precioPorTipo(tipo: TipoAsiento): number {
    if (tipo === 'vip') return 180;
    if (tipo === 'accesible') return 90;
    return 100;
  }

  private buscarAsientoCompleto(codigo: string): AsientoFuncion | null {
    return (
      this.asientosRaw().find(
        (a) => `${a.fila}-${a.numero}` === codigo,
      ) ?? null
    );
  }
}
