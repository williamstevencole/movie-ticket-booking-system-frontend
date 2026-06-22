import { Component } from '@angular/core';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss',
})
export class HistorialComponent {
  historial = [
    {
      id: 'RES-00001',
      pelicula: 'Spider-Man: Across the Spider-Verse',
      fecha: '20 Junio 2026',
      hora: '6:30 PM',
      sala: '2',
      estado: 'ASISTIDA',
    },

    {
      id: 'RES-00002',
      pelicula: 'Avatar: Fire and Ash',
      fecha: '12 Junio 2026',
      hora: '8:00 PM',
      sala: '4',
      estado: 'NO_ASISTIDA',
    },

    {
      id: 'RES-00003',
      pelicula: 'Minecraft',
      fecha: '05 Junio 2026',
      hora: '5:00 PM',
      sala: '1',
      estado: 'CANCELADA',
    },
  ];
}
