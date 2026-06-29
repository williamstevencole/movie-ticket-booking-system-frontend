import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, signal } from '@angular/core';

type EstadoCountdown = 'ok' | 'warn' | 'danger' | 'expired';

@Component({
  selector: 'app-countdown-pago',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="countdown" [class.warn]="estado() === 'warn'" [class.danger]="estado() === 'danger'" [class.expired]="estado() === 'expired'">
      @if (estado() === 'expired') {
        <span class="label">Expirada</span>
      } @else {
        <span class="label">Expira en</span>
        <span class="time tnum">{{ display() }}</span>
      }
    </span>
  `,
  styleUrl: './countdown-pago.component.scss',
})
export class CountdownPagoComponent implements OnInit, OnDestroy {
  @Input({ required: true }) expiraEn!: string | Date;
  @Output() expirado = new EventEmitter<void>();

  readonly restanteMs = signal(0);

  readonly display = computed(() => {
    const ms = Math.max(0, this.restanteMs());
    const totalSec = Math.ceil(ms / 1000);
    const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  });

  readonly estado = computed<EstadoCountdown>(() => {
    const ms = this.restanteMs();
    if (ms <= 0) return 'expired';
    if (ms <= 60_000) return 'danger';
    if (ms <= 5 * 60_000) return 'warn';
    return 'ok';
  });

  private intervalId?: number;
  private yaEmitio = false;

  ngOnInit() {
    this.tick();
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private tick() {
    const expira = new Date(this.expiraEn).getTime();
    const restante = expira - Date.now();
    this.restanteMs.set(restante);
    if (restante <= 0 && !this.yaEmitio) {
      this.yaEmitio = true;
      this.expirado.emit();
    }
  }
}
