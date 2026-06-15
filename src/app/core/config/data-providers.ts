import { Provider } from '@angular/core';

import { CiudadesService } from '../../shared/services/ciudades.service';
import { CinesService } from '../../shared/services/cines.service';
import { CuponesService } from '../../shared/services/cupones.service';

import { MockCiudadesService } from '../../mocks/services/ciudades.mock.service';
import { MockCinesService } from '../../mocks/services/cines.mock.service';
import { MockCuponesService } from '../../mocks/services/cupones.mock.service';

export const dataProviders: Provider[] = [
  { provide: CiudadesService, useClass: MockCiudadesService },
  { provide: CinesService, useClass: MockCinesService },
  { provide: CuponesService, useClass: MockCuponesService },
];
