import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pelicula-tagline',
  standalone: true,
  template: `
    @if (texto) {
      <p class="film-tagline">«{{ texto }}»</p>
    }
  `,
  styles: `
    .film-tagline {
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      font-size: 17px;
      margin: 0 0 var(--s5, 20px);
      max-width: 50ch;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class PeliculaTaglineComponent {
  @Input() texto?: string;
}
