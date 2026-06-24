import { Provider } from '@angular/core';

import { CiudadesService } from '../../shared/services/ciudades.service';
import { CinesService } from '../../shared/services/cines.service';
import { CuponesService } from '../../shared/services/cupones.service';
import { PeliculasService } from '../../shared/services/peliculas.service';
import { GenerosService } from '../../shared/services/generos.service';
import { IdiomasService } from '../../shared/services/idiomas.service';
import { FuncionesService } from '../../shared/services/funciones.service';
import { ReservasService } from '../../shared/services/reservas.service';
// PagosService and ReembolsosService are now concrete @Injectable — no mock override needed
import { PoliticasCancelacionService } from '../../shared/services/politicas-cancelacion.service';
import { TiposAsientoService } from '../../shared/services/tipos-asiento.service';
import { PreciosService } from '../../shared/services/precios.service';
import { UsuariosService } from '../../shared/services/usuarios.service';
// MetodosPagoService and CalificacionesService are now concrete @Injectable — no mock override needed

import { MockCiudadesService } from '../../mocks/services/ciudades.mock.service';
import { MockCinesService } from '../../mocks/services/cines.mock.service';
import { MockCuponesService } from '../../mocks/services/cupones.mock.service';
import { MockPeliculasService } from '../../mocks/services/peliculas.mock.service';
import { MockGenerosService } from '../../mocks/services/generos.mock.service';
import { MockIdiomasService } from '../../mocks/services/idiomas.mock.service';
import { MockFuncionesService } from '../../mocks/services/funciones.mock.service';
import { MockReservasService } from '../../mocks/services/reservas.mock.service';
// MockPagosService and MockReembolsosService no longer registered (services are now concrete HTTP classes)
import { MockPoliticasCancelacionService } from '../../mocks/services/politicas-cancelacion.mock.service';
import { MockTiposAsientoService } from '../../mocks/services/tipos-asiento.mock.service';
import { MockPreciosService } from '../../mocks/services/precios.mock.service';
import { MockUsuariosService } from '../../mocks/services/usuarios.mock.service';
// MockMetodosPagoService and MockCalificacionesService no longer registered (services are now concrete HTTP classes)

export const dataProviders: Provider[] = [
  { provide: CiudadesService, useClass: MockCiudadesService },
  { provide: CinesService, useClass: MockCinesService },
  { provide: CuponesService, useClass: MockCuponesService },
  { provide: PeliculasService, useClass: MockPeliculasService },
  { provide: GenerosService, useClass: MockGenerosService },
  { provide: IdiomasService, useClass: MockIdiomasService },
  { provide: FuncionesService, useClass: MockFuncionesService },
  { provide: ReservasService, useClass: MockReservasService },
  // PagosService and ReembolsosService: concrete HTTP services, no mock override
  { provide: PoliticasCancelacionService, useClass: MockPoliticasCancelacionService },
  { provide: TiposAsientoService, useClass: MockTiposAsientoService },
  { provide: PreciosService, useClass: MockPreciosService },
  { provide: UsuariosService, useClass: MockUsuariosService },
  // MetodosPagoService and CalificacionesService: concrete HTTP services, no mock override
];
