# Mocks

Implementaciones locales de los services de datos. Cubren todo lo no
relacionado con auth: ciudades, cines, cupones.

> El `auth.service.ts` siempre usa el backend real (login + registro).
> El resto son mocks de este folder.

## Arquitectura

```
shared/services/
├── ciudades.service.ts            ← abstract — el contrato
├── cines.service.ts               ← abstract
└── cupones.service.ts             ← abstract

mocks/
├── data/                          ← datasets puros
│   ├── ciudades.mock.ts
│   ├── cines.mock.ts
│   └── cupones.mock.ts
└── services/                      ← mock services que devuelven la data
    ├── ciudades.mock.service.ts
    ├── cines.mock.service.ts
    └── cupones.mock.service.ts
```

**Los componentes inyectan la abstracta**, nunca una concreta:

```ts
constructor(private ciudades: CiudadesService) { }
//                            ^^^^^^^^^^^^^^^ abstract class
```

Angular DI resuelve a la implementación que `core/config/data-providers.ts`
haya registrado. Eso es dependency inversion: el componente sólo conoce
el contrato, no la implementación.

## Latencia simulada

Los mock services agregan un `delay()` de ~120-180 ms con `rxjs` para que
los estados de loading de la UI se vean igual que con un backend real.
Ajustable en la constante `SIMULATED_LATENCY_MS` de cada mock service.

## Editar los datos

Los datasets están en `mocks/data/*.mock.ts`. Son arrays planos.

- `ciudades.mock.ts` — IDs `1`–`10`, una entrada por ciudad
- `cines.mock.ts` — cada cine tiene `id_ciudad` apuntando a una ciudad
- `cupones.mock.ts` — mezcla de vigentes, por vencer y vencidos

Si agregás una ciudad nueva, sumá al menos un cine con su `id_ciudad`
o el selector se quedará vacío al pickearla.

## Cómo conectar a HTTP real cuando esté listo

1. Crear `shared/services/http/<resource>.http.service.ts` extendiendo la
   abstracta y usando `HttpClient`:

   ```ts
   @Injectable()
   export class HttpCiudadesService extends CiudadesService {
     private http = inject(HttpClient);
     override list(): Observable<Ciudad[]> {
       return this.http.get<Ciudad[]>(`${API_URL}/Ciudades`);
     }
   }
   ```

2. Cambiar la línea correspondiente en `core/config/data-providers.ts`:

   ```diff
   - { provide: CiudadesService, useClass: MockCiudadesService },
   + { provide: CiudadesService, useClass: HttpCiudadesService },
   ```

3. Listo. Los componentes no se enteran del cambio — siguen inyectando
   la abstracta.

## Agregar un service mockeable nuevo

1. Definir el contrato como abstract en `shared/services/foo.service.ts`
2. Data mock en `mocks/data/foo.mock.ts`
3. Mock service en `mocks/services/foo.mock.service.ts`
4. Agregarlo a `core/config/data-providers.ts`
