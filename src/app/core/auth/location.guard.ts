import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { LocationService } from '../../shared/services/location.service';

/**
 * Exige que el usuario haya elegido ciudad+cine antes de entrar.
 *
 * - Admin/taquillero no necesitan ubicación → pasan directo.
 * - Cualquier otro (anónimo o cliente) sin selección → `/elegir-cine`.
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
