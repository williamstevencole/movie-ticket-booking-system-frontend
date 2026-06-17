import { Routes } from '@angular/router';
import { BitacoraListadoComponent } from './listado/bitacora-listado.component';
import { BitacoraDetalleComponent } from './detalle/bitacora-detalle.component';

export const BITACORA_ROUTES: Routes = [
  {
    path: '',
    component: BitacoraListadoComponent,
    children: [
      { path: 'detalle/:id', component: BitacoraDetalleComponent },
    ],
  },
];
