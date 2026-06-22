import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tiempo-restante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tiempo-restante.component.html',
  styleUrl: './tiempo-restante.component.scss',
})
export class TiempoRestanteComponent implements OnInit, OnDestroy {
  @Input({ required: true }) fechaHora!: string;
  @Input() variante: 'pill' | 'banner' = 'pill';

  readonly minutosRestantes = signal<number>(0);
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.recompute();
    this.tickHandle = setInterval(() => this.recompute(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.tickHandle !== null) clearInterval(this.tickHandle);
  }

  private recompute(): void {
    const diffMs = new Date(this.fechaHora).getTime() - Date.now();
    this.minutosRestantes.set(Math.floor(diffMs / 60_000));
  }

  get pasado(): boolean {
    return this.minutosRestantes() <= 0;
  }

  get tono(): 'muy-urgente' | 'urgente' | 'normal' {
    const m = this.minutosRestantes();
    if (m < 180) return 'muy-urgente';
    if (m <= 1440) return 'urgente';
    return 'normal';
  }

  get textoCorto(): string {
    const m = this.minutosRestantes();
    if (m <= 0) return '';
    if (m < 60) return `En ${m} min`;
    if (m < 1440) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem === 0 ? `En ${h}h` : `En ${h}h ${rem}min`;
    }
    const dias = Math.floor(m / 1440);
    return dias === 1 ? 'En 1 día' : `En ${dias} días`;
  }
}
