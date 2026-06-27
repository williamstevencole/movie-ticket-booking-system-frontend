import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

const ACCESS_TOKEN_KEY = 'cinetario.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(ACCESS_TOKEN_KEY)
      : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // sesión inválida → limpiar y mandar al login (excepto en el propio login)
      // adicionalmente si se equivoca al resetear su contrasena que tampoco lo mande al login
      if (
        error.status === 401 &&
        !req.url.endsWith('/auth/login') &&
        !req.url.endsWith('/auth/register') &&
        !req.url.endsWith('/password')
      ) {
        auth.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
