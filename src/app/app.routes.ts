import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { locationGuard } from './core/auth/location.guard';
import { rootRedirect } from './core/auth/root-redirect';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirect],
    children: [],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'olvide-password',
    loadComponent: () =>
      import('./features/auth/password/olvide-password.component').then(
        (m) => m.OlvidePasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'elegir-cine',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/location-selector.component').then(
        (m) => m.LocationSelectorComponent,
      ),
  },
  {
    path: 'cartelera',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/cartelera/home/home.component').then(
        (m) => m.CarteleraHomeComponent,
      ),
  },
  {
    path: 'buscar',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/busqueda/resultados/resultados.component').then(
        (m) => m.BusquedaResultadosComponent,
      ),
  },
  {
    path: 'pelicula/:id',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/pelicula/detalle/detalle.component').then(
        (m) => m.PeliculaDetalleComponent,
      ),
  },
  {
    path: 'cupones',
    redirectTo: 'cuenta/cupones',
    pathMatch: 'full',
  },
  {
    path: 'cuenta',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/account-shell/account-shell.component').then(
        (m) => m.AccountShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'boletos', pathMatch: 'full' },
      {
        path: 'boletos',
        loadComponent: () =>
          import('./features/account-shell/boletos-placeholder.component').then(
            (m) => m.BoletosPlaceholderComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil/perfil.component').then(
            (m) => m.PerfilPageComponent,
          ),
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./features/perfil/seguridad/seguridad.component').then(
            (m) => m.SeguridadPageComponent,
          ),
      },
      {
        path: 'cupones',
        loadComponent: () =>
          import('./features/perfil/cupones/cupones.component').then(
            (m) => m.PerfilCuponesComponent,
          ),
      },
      {
        path: 'metodos-pago',
        loadComponent: () =>
          import('./features/perfil/metodos-pago/metodos-pago.component').then(
            (m) => m.MetodosPagoPageComponent,
          ),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/perfil/notificaciones/notificaciones.component').then(
            (m) => m.NotificacionesPageComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/home.component').then(
        (m) => m.AdminHomeComponent,
      ),
  },
  {
    path: 'admin/ciudades',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/ciudades/ciudades.component').then(
        (m) => m.AdminCiudadesComponent,
      ),
  },
  {
    path: 'admin/peliculas',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/peliculas/listado/peliculas.component').then(
        (m) => m.AdminPeliculasComponent,
      ),
  },
  {
    path: 'admin/peliculas/crear',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/peliculas/form/pelicula-form.component').then(
        (m) => m.AdminPeliculaFormComponent,
      ),
  },
  {
    path: 'admin/peliculas/:id/editar',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/peliculas/form/pelicula-form.component').then(
        (m) => m.AdminPeliculaFormComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
