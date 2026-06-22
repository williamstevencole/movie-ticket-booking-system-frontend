import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() duracionSegundos = 600;
  @Output() expirado = new EventEmitter<void>();

  readonly restantes = signal(0);
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  readonly mm = computed(() => String(Math.floor(this.restantes() / 60)).padStart(2, '0'));
  readonly ss = computed(() => String(this.restantes() % 60).padStart(2, '0'));
  readonly urgente = computed(() => this.restantes() < 120);

  ngOnInit(): void {
    this.restantes.set(this.duracionSegundos);
    this.tickHandle = setInterval(() => {
      const r = this.restantes() - 1;
      if (r <= 0) {
        this.restantes.set(0);
        if (this.tickHandle !== null) clearInterval(this.tickHandle);
        this.tickHandle = null;
        this.expirado.emit();
      } else {
        this.restantes.set(r);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.tickHandle !== null) clearInterval(this.tickHandle);
  }
}