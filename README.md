# nest-js-warehouse

In-memory warehouse registry for NestJS applications.

## Disclaimer

> This module is in beta. It was created as a real-world test project to practice new skills and TDD with Codex. It has been tested on a fresh NestJS project. The core decorator feature works, but the author cannot provide any guarantee for production use.

## Installation

```bash
npm install nest-js-warehouse
```

`@nestjs/common`, `@nestjs/core`, `reflect-metadata`, and `rxjs` are peer dependencies.

## Why

Use this package for values that should be loaded once during application bootstrap and then shared through a singleton Nest service.

Good fits include:

- static dictionary data
- lookup tables
- application registries
- metadata
- precomputed values
- shared runtime state

This is an in-memory store. Data is lost when the Node.js process restarts. It is not Redis, not a persistent cache, and not suitable for sharing data between multiple Node.js processes without external storage.

## Basic usage

Import the module once and register loader providers anywhere in the Nest application.

```ts
import { Module } from "@nestjs/common";
import { WarehouseModule } from "nest-js-warehouse";
import { CountriesWarehouseLoader } from "./countries.loader";

@Module({
  imports: [WarehouseModule.forRoot()],
  providers: [CountriesWarehouseLoader],
})
export class AppModule {}
```

## Using `forRoot()`

```ts
WarehouseModule.forRoot({
  freezeValues: true,
  failOnLoaderError: true,
});
```

Defaults:

- `freezeValues: true`
- `failOnLoaderError: true`

## Using `forRootAsync()`

Use `forRootAsync()` when options depend on other providers.

```ts
WarehouseModule.forRootAsync({
  imports: [DatabaseModule],
  inject: [DatabaseService],
  useFactory: (database: DatabaseService) => ({
    beforeInit: () => database.waitUntilReady(),
    freezeValues: true,
    failOnLoaderError: true,
  }),
});
```

The first version supports `useFactory` only.

## Waiting for database initialization

`beforeInit()` is the correct place to wait for a database, remote service, or other dependency before warehouse loaders run.

Loaders run in Nest's `onApplicationBootstrap()` phase, after modules have initialized.

`beforeInit()` is bootstrap-only. Runtime refresh does not call `beforeInit()`.

## Registering warehouse loaders

```ts
import { Injectable } from "@nestjs/common";
import { WarehouseItem } from "nest-js-warehouse";

@Injectable()
export class CountriesWarehouseLoader {
  constructor(private readonly repository: CountryRepository) {}

  @WarehouseItem({ key: "countries" })
  async loadCountries() {
    const countries = await this.repository.findAll();

    return new Map(countries.map((country) => [country.code, country]));
  }
}
```

Loader methods may return plain values or promises.

## Reading from warehouse

```ts
import { Injectable } from "@nestjs/common";
import { WarehouseService } from "nest-js-warehouse";

@Injectable()
export class SomeService {
  constructor(private readonly warehouse: WarehouseService) {}

  getCountry(code: string) {
    const countries = this.warehouse.get<Map<string, Country>>("countries");

    return countries.get(code);
  }
}
```

`get()` throws if the warehouse is not ready or the key is missing. Use `tryGet()` when a missing key should return `undefined`.

When `ns` is omitted, warehouse reads and writes use the root namespace.

Use namespace-aware addressing when the same logical key should exist in more than one scope:

```ts
const rootDraft = warehouse.get<string[]>("draft");
const chapterDraft = warehouse.get<string[]>("draft", { ns: 'chapter1' });
```

`keys()` without `ns` returns only root keys, and `keys({ ns })` returns only keys from that namespace.

`clear({ ns })` removes only that namespace. Global `clear()` still resets the whole warehouse and readiness state.

To reload one item with its original loader:

```ts
const countries = await warehouse.refresh<Map<string, Country>>("countries");
```

If refresh fails, the previous value remains in the warehouse.

If no loader was registered for the key, `refresh()` throws:

```txt
Warehouse loader not found: <key>
```

Namespaced refresh is not supported in the first version because loader registration remains root-only.

## Error handling

With `failOnLoaderError: true`, a loader error stops bootstrap.

With `failOnLoaderError: false`, the error is logged and the explorer continues with the remaining loaders.

## Freezing values

`freezeValues` defaults to `true`. Plain objects and arrays are shallow-frozen before they are stored.

Manual writes through `set()` use the global `freezeValues` default, but each call can override it:

```ts
warehouse.set("draft", [], { freeze: false });
warehouse.set("final", ["CZ", "US"], { freeze: true });
warehouse.set("draft", [], { freeze: false, ns: 'chapter1' });
warehouse.set("final", ["CZ", "US"], { freeze: true, ns: 'chapter1' });
```

Frozen objects cannot be unfrozen. There is no unlock operation. To change a frozen value, create a replacement value and store it again with the same key.

`Map`, `Set`, `Date`, primitive values, and `null` are returned unchanged. Deep freeze is intentionally not implemented in the first version.

Namespaced symbol keys are not supported in the first version. Root symbol keys remain supported.

## Best practices

- Use warehouse data for static and lookup-style data.
- Keep loaders independent from this library's internals.
- Wait for databases or external systems through `beforeInit()`.
- Avoid storing request-scoped or user-specific data.
- Do not use this as a distributed cache.
- Do not expect `refreshAll()`, TTL, invalidation, distributed cache behavior, or deep freeze. They are out of scope for this version.

## API reference

```ts
WarehouseModule.forRoot(options?: WarehouseModuleOptions)
WarehouseModule.forRootAsync(options: WarehouseModuleAsyncOptions)
```

```ts
interface WarehouseModuleOptions {
  beforeInit?: () => Promise<void> | void;
  freezeValues?: boolean;
  failOnLoaderError?: boolean;
}
```

```ts
interface WarehouseModuleAsyncOptions {
  imports?: ModuleMetadata["imports"];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => WarehouseModuleOptions | Promise<WarehouseModuleOptions>;
}
```

```ts
interface WarehouseNamespaceOptions {
  ns?: string;
}
```

```ts
interface WarehouseSetOptions {
  freeze?: boolean;
  ns?: string;
}
```

```ts
WarehouseService.set<T>(
  key: string | symbol,
  value: T,
  options?: WarehouseSetOptions,
): void
WarehouseService.get<T>(
  key: string | symbol,
  options?: WarehouseNamespaceOptions,
): T
WarehouseService.tryGet<T>(
  key: string | symbol,
  options?: WarehouseNamespaceOptions,
): T | undefined
WarehouseService.refresh<T>(
  key: string | symbol,
  options?: WarehouseNamespaceOptions,
): Promise<T>
WarehouseService.has(
  key: string | symbol,
  options?: WarehouseNamespaceOptions,
): boolean
WarehouseService.keys(
  options?: WarehouseNamespaceOptions,
): Array<string | symbol>
WarehouseService.isReady(): boolean
WarehouseService.markReady(): void
WarehouseService.clear(options?: WarehouseNamespaceOptions): void
```

```ts
@WarehouseItem({ key: 'countries' })
```

## License

MIT
