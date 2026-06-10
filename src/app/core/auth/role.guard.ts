import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { homeForRole } from './role-redirect';

/**
 * Permite el acceso sólo si el rol del JWT actual está en `allowed`.
 * Si el usuario tiene sesión pero rol incorrecto, lo redirige al home
 * que sí le corresponde — nunca a una página de "acceso denegado".
 */
export const roleGuard = (allowed: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.role();
    if (role && allowed.includes(role)) {
      return true;
    }

    if (auth.isAuthenticated()) {
      router.navigateByUrl(homeForRole(role));
    } else {
      router.navigate(['/login']);
    }
    return false;
  };
};
