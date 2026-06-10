import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { LocationService } from '../../shared/services/location.service';

/**
 * Permite entrar sólo si:
 * - el rol no necesita ubicación (admin / taquillero), o
 * - el cliente ya eligió ciudad y cine.
 *
 * Si es cliente sin ubicación, lo redirige a `/elegir-cine`.
 */
export const locationGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const loc = inject(LocationService);
  const router = inject(Router);

  const role = auth.role();
  if (role === 'admin' || role === 'taquillero') return true;

  if (loc.hasSelection()) return true;

  router.navigate(['/elegir-cine']);
  return false;
};
