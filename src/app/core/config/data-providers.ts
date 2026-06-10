import { Provider } from '@angular/core';

// abstractas (contratos)
import { CiudadesService } from '../../shared/services/ciudades.service';
import { CinesService } from '../../shared/services/cines.service';
import { CuponesService } from '../../shared/services/cupones.service';

// implementaciones mock
import { MockCiudadesService } from '../../mocks/services/ciudades.mock.service';
import { MockCinesService } from '../../mocks/services/cines.mock.service';
import { MockCuponesService } from '../../mocks/services/cupones.mock.service';

/**
 * Resuelve qué implementación inyectar para cada service de datos.
 * Hoy todos los datos (ciudades, cines, cupones) son mock — los componentes
 * inyectan la clase abstracta y Angular les entrega la mock concreta.
 *
 * Para conectar a HTTP real más adelante:
 *   1. Crear `shared/services/http/<resource>.http.service.ts` que extienda
 *      la abstracta y use `HttpClient`.
 *   2. Reemplazar acá la línea correspondiente:
 *        { provide: CiudadesService, useClass: HttpCiudadesService }
 *
 * No hay que tocar ningún componente — la abstracta es el contrato.
 */
export const dataProviders: Provider[] = [
  { provide: CiudadesService, useClass: MockCiudadesService },
  { provide: CinesService, useClass: MockCinesService },
  { provide: CuponesService, useClass: MockCuponesService },
];
