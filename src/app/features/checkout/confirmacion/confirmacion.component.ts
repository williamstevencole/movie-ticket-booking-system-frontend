import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StepperComponent } from '../stepper/stepper.component';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink, StepperComponent, AppbarComponent, FooterComponent],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss',
})
export class ConfirmacionComponent {
  @Input() pelicula = 'Spider-Man: Across the Spider-Verse';
  @Input() cine = 'Cinetario Mall';
  @Input() sala = 'Sala 4';
  @Input() fechaHora = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  @Input() asientos: string[] = ['A3', 'A4'];
  @Input() total = 215;
}
