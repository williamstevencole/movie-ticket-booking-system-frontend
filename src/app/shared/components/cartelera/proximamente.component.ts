import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';


@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './proximamente.component.html',
  styleUrls: ['./proximamente.component.scss'],
})
export class ProximamenteComponent {
  readonly peliculas = [
    {
      titulo: 'El último amanecer',
      poster: 'poster-2',
      fecha: '20 Jun',
      tag: 'estreno',
    },
    {
      titulo: 'Sombras del viento',
      poster: 'poster-3',
      fecha: '27 Jun',
      tag: 'vip',
    },
    {
      titulo: 'Horizonte perdido',
      poster: 'poster-4',
      fecha: '04 Jul',
      tag: 'ultima',
    },
  ];
}
