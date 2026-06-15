import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideStar,
} from '@lucide/angular';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, LucideChevronLeft, LucideChevronRight, LucideStar],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss'],
})
export class HeroCarouselComponent {
  readonly slides = [
    {
      titulo: 'La hora del lobo',
      genero: 'Drama',
      duracion: '118 min',
      idioma: 'VOSE',
      rating: '4.6',
      poster: 'poster-1',
      tag: 'estreno',
      desc: 'Una odisea sonora en el norte congelado.',
    },
    {
      titulo: 'Sombras del viento',
      genero: 'Misterio',
      duracion: '126 min',
      idioma: 'ESP',
      rating: '4.2',
      poster: 'poster-2',
      tag: 'vip',
      desc: 'Un thriller atmosférico lleno de tensión.',
    },
    {
      titulo: 'Horizonte perdido',
      genero: 'Aventura',
      duracion: '134 min',
      idioma: 'ESP',
      rating: '4.8',
      poster: 'poster-4',
      tag: 'estreno',
      desc: 'Una expedición épica hacia lo desconocido.',
    },
  ];

  index = signal(0);

  next() {
    this.index.update(i => (i + 1) % this.slides.length);
  }

  prev() {
    this.index.update(i => (i - 1 + this.slides.length) % this.slides.length);
  }
}