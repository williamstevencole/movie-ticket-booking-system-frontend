import { Component, Input, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LatLng, haversineKm, formatDistance } from '../../../../shared/utils/geo.util';

@Component({
  selector: 'app-distancia-cine',
  standalone: true,
  template: `
    @if (distancia(); as d) {
      <span class="dist">· {{ d }}</span>
    }
  `,
  styles: `
    .dist { color: inherit; font-weight: 500; }
  `,
})
export class DistanciaCineComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  @Input({ required: true }) coords!: LatLng;

  readonly distancia = signal<string | null>(null);
  readonly userCoords = signal<LatLng | null>(null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userCoords.set(user);
        const km = haversineKm(user, this.coords);
        this.distancia.set(formatDistance(km));
      },
      () => {
        /* permiso denegado: solo dirección, sin distancia */
      },
      { maximumAge: 600_000, timeout: 8000 },
    );
  }

  mapsUrl(): string {
    return `https://maps.google.com/?q=${this.coords.lat},${this.coords.lng}`;
  }
}
