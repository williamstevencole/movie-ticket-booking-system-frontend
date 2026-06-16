import { Component } from '@angular/core';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [AppbarComponent, FooterComponent],
  template: `
    <app-appbar [navItems]="nav" />

    <main class="wrap">
      <header class="head">
        <h1>Mis boletos</h1>
        <p>Acá vas a ver las funciones que ya reservaste.</p>
      </header>

      <section class="empty">
        <div class="empty-card">
          <h2>Todavía no tenés boletos</h2>
          <p>Cuando compres una función, va a aparecer acá.</p>
        </div>
      </section>
    </main>

    <app-footer />
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: var(--bg-soft); }
    .wrap { max-width: 1100px; margin: 0 auto; padding: var(--s8) var(--s6); }
    .head h1 { font-size: 28px; font-weight: 800; margin: 0 0 var(--s2); }
    .head p { color: var(--text-2); margin: 0 0 var(--s7); }
    .empty-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: var(--s8);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .empty-card h2 { font-size: 18px; font-weight: 700; margin: 0 0 var(--s2); }
    .empty-card p { color: var(--text-2); margin: 0; }
  `,
})
export class MisBoletosComponent {
  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];
}
