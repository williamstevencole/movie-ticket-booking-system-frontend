import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-seat-error',
  standalone: true,
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  @Input() asiento?: string;
}
