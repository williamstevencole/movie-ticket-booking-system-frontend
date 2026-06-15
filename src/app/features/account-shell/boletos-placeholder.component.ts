import { Component } from '@angular/core';

@Component({
  selector: 'app-boletos-placeholder',
  standalone: true,
  template: `
    <div class="panel">
      <h2>Mis boletos</h2>
      <p class="sub">
        hola
      </p>
    </div>
  `,
  styles: `
    .panel {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: var(--s6);
      box-shadow: var(--shadow-sm);
    }
    .panel h2 { font-size: 22px; font-weight: 800; margin: 0 0 var(--s2); }
    .sub { color: var(--text-2); font-size: 14px; margin: 0; line-height: 1.5; }
  `,
})
export class BoletosPlaceholderComponent {}
