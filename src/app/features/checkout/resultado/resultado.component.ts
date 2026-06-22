import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { LucideCheck, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, RouterLink, AppbarComponent, FooterComponent, LucideCheck, LucideX],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.scss',
})
export class ResultadoComponent {
  @Input() resultado: 'exito' | 'error' = 'exito';
  @Input() email = 'tu@email.com';
  @Input() numeroReserva = '#CT-48291';
  @Input() pelicula = 'Spider-Man: Across the Spider-Verse';
  @Input() cine = 'Cinetario Mall';
  @Input() fechaHora = new Date().toISOString();
  @Input() asientos: string[] = ['A3', 'A4'];
  @Input() total = 215;
  @Input() mensajeError: string | null = null;
}
