import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-display.component.html',
  styleUrls: ['./rating-display.component.scss'],
})
export class RatingDisplayComponent {
  @Input() promedio: number | null | undefined;
  @Input() count = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get visible(): boolean { return this.count > 0 && this.promedio != null; }
  get formatted(): string { return (this.promedio ?? 0).toFixed(1); }
}
