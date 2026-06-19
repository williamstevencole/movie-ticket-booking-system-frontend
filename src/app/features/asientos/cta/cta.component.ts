import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cta',
  standalone: true,
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss',
})
export class CtaComponent {
  @Output() continuar = new EventEmitter<void>();

  @Output() cancelar = new EventEmitter<void>();
}
