import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AppbarComponent } from '../../shared/components/appbar/appbar.component';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppbarComponent],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent {
  private auth = inject(AuthService);

  readonly user = this.auth.user;

  readonly nav = [
    { label: 'Cartelera', route: '/cartelera' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/cuenta/boletos', active: true },
  ];

  initials(): string {
    const name = this.user()?.nombre ?? '?';
    return name
      .split(' ')
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }
}
