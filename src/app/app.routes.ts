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
      import('./features/client/home.component').then(
        (m) => m.ClientHomeComponent,
      ),
  },
  {
    path: 'cupones',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/cupones/list.component').then(
        (m) => m.CuponesListComponent,
      ),
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
