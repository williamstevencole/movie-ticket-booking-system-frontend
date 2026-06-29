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
    path: 'proximos-estrenos',
    loadComponent: () =>
      import('./features/cartelera/proximos-estrenos/proximos-estrenos.component').then(
        (m) => m.ProximosEstrenosComponent,
      ),
  },
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
    loadComponent: () =>
      import('./features/pelicula/detalle/detalle.component').then(
        (m) => m.PeliculaDetalleComponent,
      ),
  },
  {
    path: 'sala/:id',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/asientos/mapa/mapa.component').then(
        (m) => m.MapaComponent,
      ),
  },
  {
    path: 'checkout/confirmacion',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/checkout/confirmacion/confirmacion.component').then(
        (m) => m.ConfirmacionComponent,
      ),
  },
  {
    path: 'checkout/metodos-pago',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/checkout/metodos-pago/metodos-pago.component').then(
        (m) => m.MetodosPagoComponent,
      ),
  },
  {
    path: 'checkout/resultado',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/checkout/resultado/resultado.component').then(
        (m) => m.ResultadoComponent,
      ),
  },
  {
    path: 'mis-boletos',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/boletos/mis-boletos/mis-boletos.component').then(
        (m) => m.MisBoletosComponent,
      ),
  },
  {
    path: 'cancelar/:id',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/cancelacion/cancelar/cancelar.component').then(
        (m) => m.CancelarComponent,
      ),
  },
  {
    path: 'reembolsos/:id',
    canActivate: [authGuard, locationGuard],
    loadComponent: () =>
      import('./features/boletos/mis-boletos/reembolsos/reembolsos.component').then(
        (m) => m.ReembolsosComponent,
      ),
  },
  {
    path: 'cupones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cupones/list.component').then((m) => m.CuponesListComponent),
  },
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
        path: 'metodos-pago',
        loadComponent: () =>
          import('./features/perfil/metodos-pago/metodos-pago.component').then(
            (m) => m.MetodosPagoPageComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/home.component').then(
        (m) => m.AdminHomeComponent,
      ),
  },
  {
    path: 'admin/ciudades',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/ciudades/ciudades.component').then(
        (m) => m.AdminCiudadesComponent,
      ),
  },
  {
    path: 'admin/cines',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/cines/listado/cines.component').then(
        (m) => m.AdminCinesComponent,
      ),
  },
  {
    path: 'admin/cines/crear',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/cines/crear/cine-form.component').then(
        (m) => m.AdminCineFormComponent,
      ),
  },
  {
    path: 'admin/cines/:id/editar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/cines/editar/cine-editar.component').then(
        (m) => m.AdminCineEditarComponent,
      ),
  },
  {
    path: 'admin/salas',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/salas/listado/salas.component').then(
        (m) => m.AdminSalasComponent,
      ),
  },
  {
    path: 'admin/salas/crear',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/salas/crear/sala-form.component').then(
        (m) => m.AdminSalaFormComponent,
      ),
  },
  {
    path: 'admin/salas/:cineId/:salaId/editar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/salas/editar/sala-editar.component').then(
        (m) => m.AdminSalaEditarComponent,
      ),
  },
  {
    path: 'admin/salas/:cineId/:salaId/distribucion',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/salas/distribucion/distribucion.component').then(
        (m) => m.AdminSalaDistribucionComponent,
      ),
  },
  {
    path: 'admin/tipos-asiento',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/tipos-asiento/tipos-asiento.component').then(
        (m) => m.AdminTiposAsientoComponent,
      ),
  },
  {
    path: 'admin/precios',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/precios/precios.component').then(
        (m) => m.AdminPreciosComponent,
      ),
  },
  {
    path: 'admin/reembolsos',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/reembolsos/reembolsos.component').then(
        (m) => m.AdminReembolsosComponent,
      ),
  },
  {
    path: 'admin/usuarios-roles',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/usuarios-roles/usuarios-roles.component').then(
        (m) => m.AdminUsuariosRolesComponent,
      ),
  },
  {
    path: 'admin/recepcionista/buscar-cliente',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/recepcionista/buscar-cliente/buscar-cliente.component').then(
        (m) => m.RecepcionistaBuscarClienteComponent,
      ),
  },
  {
    path: 'admin/recepcionista/pago-efectivo/:numero',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/recepcionista/pago-efectivo/pago-efectivo.component').then(
        (m) => m.RecepcionistaPagoEfectivoComponent,
      ),
  },
  {
    path: 'admin/cupones',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/cupones/listado/cupones.component').then(
        (m) => m.AdminCuponesComponent,
      ),
  },
  {
    path: 'admin/cupones/crear',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/cupones/crear/cupon-form.component').then(
        (m) => m.AdminCuponFormComponent,
      ),
  },
  {
    path: 'admin/generos',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/generos/generos.component').then(
        (m) => m.AdminGenerosComponent,
      ),
  },
  {
    path: 'admin/idiomas',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/idiomas/idiomas.component').then(
        (m) => m.AdminIdiomasComponent,
      ),
  },
  {
    path: 'admin/peliculas',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/peliculas/listado/peliculas.component').then(
        (m) => m.AdminPeliculasComponent,
      ),
  },
  {
    path: 'admin/peliculas/crear',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/peliculas/form/pelicula-form.component').then(
        (m) => m.AdminPeliculaFormComponent,
      ),
  },
  {
    path: 'admin/peliculas/:id/editar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/peliculas/form/pelicula-form.component').then(
        (m) => m.AdminPeliculaFormComponent,
      ),
  },
  {
    path: 'admin/funciones',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/funciones/listado/funciones.component').then(
        (m) => m.AdminFuncionesComponent,
      ),
  },
  {
    path: 'admin/funciones/crear',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/funciones/form/funcion-form.component').then(
        (m) => m.AdminFuncionFormComponent,
      ),
  },
  {
    path: 'admin/funciones/:id/editar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/funciones/form/funcion-form.component').then(
        (m) => m.AdminFuncionFormComponent,
      ),
  },
  {
    path: 'admin/funciones/:id/cancelar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/funciones/cancelar/cancelar-funcion.component').then(
        (m) => m.AdminCancelarFuncionComponent,
      ),
  },
  {
    path: 'admin/reservas',
    pathMatch: 'full',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/reservas/listado/reservas-listado.component').then(
        (m) => m.AdminReservasListadoComponent,
      ),
  },
  {
    path: 'admin/reservas/:id/cancelar',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/reservas/cancelar/reserva-cancelar.component').then(
        (m) => m.AdminReservaCancelarComponent,
      ),
  },
  {
    path: 'admin/reservas/:id',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/reservas/detalle/reserva-detalle.component').then(
        (m) => m.AdminReservaDetalleComponent,
      ),
  },
  {
    path: 'admin/pagos',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/pagos/pagos-listado.component').then(
        (m) => m.AdminPagosListadoComponent,
      ),
  },
  {
    path: 'admin/clientes',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/clientes/listado/clientes.component').then(
        (m) => m.AdminClientesComponent,
      ),
  },
  {
    path: 'admin/politicas',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/politicas/configuracion/politicas-config.component').then(
        (m) => m.AdminPoliticasConfigComponent,
      ),
  },
  {
    path: 'admin/bitacora',
    canActivate: [authGuard, roleGuard(['admin'])],
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
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./features/admin/reportes/reservas/reservas.component').then(
        (m) => m.AdminReporteReservasComponent,
      ),
  },
  {
    path: 'admin/reportes/estadisticas-cancelacion',
    canActivate: [authGuard, roleGuard(['admin'])],
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
  {
    path: 'proximos-estrenos',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./features/proximos-estrenos/proximos-estrenos.component').then(
        (m) => m.ProximosEstrenosComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
