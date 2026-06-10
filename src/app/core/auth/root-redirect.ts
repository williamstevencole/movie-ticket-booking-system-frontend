import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { LocationService } from '../../shared/services/location.service';
import { homeAfterLogin } from './role-redirect';

/**
 * Decisión del root: si hay sesión válida, mandamos al home que corresponde
 * al rol (y, para cliente, al selector de cine si todavía no eligió ubicación).
 * Si no hay sesión, al login.
 */
export const rootRedirect: CanActivateFn = () => {
  const auth = inject(AuthService);
  const loc = inject(LocationService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigateByUrl(homeAfterLogin(auth.role(), loc.hasSelection()));
  } else {
    router.navigate(['/login']);
  }
  return false;
};
