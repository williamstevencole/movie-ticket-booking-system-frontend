import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { locationGuard } from './core/auth/location.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./features/cartelera/home/home.component').then(
        (m) => m.CarteleraHomeComponent,
      ),
  },
  { path: 'cartelera', redirectTo: '', pathMatch: 'full' },
  {
    path: 'elegir-cine',
    loadComponent: () =>
      import('./features/onboarding/location-selector.component').then(
        (m) => m.LocationSelectorComponent,
      ),
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
    path: 'buscar',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./features/busqueda/resultados/resultados.component').then(
        (m) => m.BusquedaResultadosComponent,
      ),
  },
  {
    path: 'pelicula/:id',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./features/pelicula/detalle/detalle.component').then(
        (m) => m.PeliculaDetalleComponent,
      ),
  },
  {
    path: 'sala/:id',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./features/asientos/mapa/mapa.component').then(
        (m) => m.MapaComponent,
      ),
  },
  {
    path: 'checkout/confirmacion',
    loadComponent: () =>
      import('./features/checkout/confirmacion/confirmacion.component').then(
        (m) => m.ConfirmacionComponent,
      ),
  },
  {
    path: 'checkout/metodos-pago',
    loadComponent: () =>
      import('./features/checkout/metodos-pago/metodos-pago.component').then(
        (m) => m.MetodosPagoComponent,
      ),
  },
  {
    path: 'mis-boletos',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/boletos/mis-boletos.component').then(
        (m) => m.MisBoletosComponent,
      ),
  },
  { path: 'cupones', redirectTo: 'cuenta/cupones', pathMatch: 'full' },
  {
    path: 'cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account-shell/account-shell.component').then(
        (m) => m.AccountShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
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
    path: 'admin/generos',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/generos/generos.component').then(
        (m) => m.AdminGenerosComponent,
      ),
  },
  {
    path: 'admin/idiomas',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/idiomas/idiomas.component').then(
        (m) => m.AdminIdiomasComponent,
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
  {
    path: 'admin/funciones',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/funciones/listado/funciones.component').then(
        (m) => m.AdminFuncionesComponent,
      ),
  },
  {
    path: 'admin/funciones/crear',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/funciones/form/funcion-form.component').then(
        (m) => m.AdminFuncionFormComponent,
      ),
  },
  {
    path: 'admin/funciones/:id/editar',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/funciones/form/funcion-form.component').then(
        (m) => m.AdminFuncionFormComponent,
      ),
  },
  {
    path: 'admin/funciones/:id/cancelar',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/funciones/cancelar/cancelar-funcion.component').then(
        (m) => m.AdminCancelarFuncionComponent,
      ),
  },
  {
    path: 'admin/reservas',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/reservas/listado/reservas-listado.component').then(
        (m) => m.AdminReservasListadoComponent,
      ),
  },
  {
    path: 'admin/reservas/:id',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/reservas/detalle/reserva-detalle.component').then(
        (m) => m.AdminReservaDetalleComponent,
      ),
  },
  {
    path: 'admin/pagos',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/pagos/pagos-listado.component').then(
        (m) => m.AdminPagosListadoComponent,
      ),
  },
  {
    path: 'admin/bitacora',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadChildren: () =>
      import('./features/admin/bitacora/bitacora.routes').then(
        (m) => m.BITACORA_ROUTES,
      ),
  },
  {
    path: 'admin/reportes',
    pathMatch: 'full',
    redirectTo: 'admin/reportes/reservas',
  },
  {
    path: 'admin/reportes/reservas',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/reportes/reservas/reservas.component').then(
        (m) => m.AdminReporteReservasComponent,
      ),
  },
  {
    path: 'admin/reportes/estadisticas-cancelacion',
    canActivate: [authGuard, roleGuard(['admin', 'taquillero'])],
    loadComponent: () =>
      import('./features/admin/reportes/estadisticas-cancelacion/estadisticas-cancelacion.component').then(
        (m) => m.AdminReporteEstadisticasCancelacionComponent,
      ),
  },
  {
    path: 'admin/reportes/pagos-reembolsos',
    redirectTo: 'admin/pagos',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '' },
];
