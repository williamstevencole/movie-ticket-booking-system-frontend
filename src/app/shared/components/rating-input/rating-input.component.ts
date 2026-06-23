import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-input.component.html',
  styleUrls: ['./rating-input.component.scss'],
})
export class RatingInputComponent {
  @Input() valor: number | null | undefined;
  @Input() disabled = false;
  @Output() calificar = new EventEmitter<number>();
  @Output() borrar = new EventEmitter<void>();

  hover: number | null = null;

  estrellas = [1, 2, 3, 4, 5];

  fill(n: number): boolean {
    const ref = this.hover ?? this.valor ?? 0;
    return n <= ref;
  }

  onClick(n: number) {
    if (this.disabled) return;
    this.calificar.emit(n);
  }

  onKeydown(ev: KeyboardEvent, n: number) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.onClick(n);
    }
  }

  onBorrar() {
    if (this.disabled) return;
    this.borrar.emit();
  }
}
