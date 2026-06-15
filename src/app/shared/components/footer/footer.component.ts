import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="appfoot">
      <div class="wrap">
        <div class="appfoot-grid">
          <div>
            <a routerLink="/cartelera" class="brand"
              ><span class="mark">C</span>Cinetario</a
            >
            <p class="desc">
              La forma fácil de comprar boletos de cine en Honduras. Cartelera
              actualizada al instante.
            </p>
          </div>
          <div>
            <h4>Cinetario</h4>
            <ul>
              <li><a routerLink="/cartelera">Cartelera</a></li>
              <li><a>Próximos estrenos</a></li>
              <li><a>Promociones</a></li>
              <li><a>Cines y salas</a></li>
            </ul>
          </div>
          <div>
            <h4>Cuenta</h4>
            <ul>
              <li><a routerLink="/cuenta/boletos">Mis boletos</a></li>
              <li><a routerLink="/cuenta/perfil">Perfil</a></li>
              <li><a routerLink="/cuenta/cupones">Cupones</a></li>
            </ul>
          </div>
          <div>
            <h4>Ayuda</h4>
            <ul>
              <li><a>Política de cancelación</a></li>
              <li><a>Preguntas frecuentes</a></li>
              <li><a>Contacto</a></li>
            </ul>
          </div>
        </div>
        <div class="colophon">
          <span>© 2026 Cinetario · Todos los derechos reservados</span>
          <span><a routerLink="/admin">Acceso operadores →</a></span>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
