import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-funcion-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcion-bar.component.html',
  styleUrl: './funcion-bar.component.scss',
})
export class FuncionBarComponent {
  @Input({ required: true }) pelicula!: string;
  @Input({ required: true }) cine!: string;
  @Input({ required: true }) sala!: string;
  @Input({ required: true }) fechaHora!: string; // ISO Timestamptz
  @Input() duracionMin: number | null = null;
  @Input() idioma: string | null = null;
  @Input() posterUrl: string | null = null;
}
