---
name: test
description: "Skill for the Test area of nest-js-warehouse. 12 symbols across 9 files."
---

# Test

12 symbols | 9 files | Cohesion: 100%

## When to Use

- Working with code in `test/`
- Understanding how WarehouseItem, WarehouseService, WarehouseExplorer work
- Modifying test-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `test/warehouse.explorer.spec.ts` | createExplorer, TestLoader, FailingLoader, RefreshingLoader |
| `test/warehouse.service.spec.ts` | createService |
| `src/warehouse.service.ts` | WarehouseService |
| `src/warehouse.explorer.ts` | WarehouseExplorer |
| `src/internal/warehouse-loader.registry.ts` | WarehouseLoaderRegistry |
| `src/internal/warehouse-item.discovery.ts` | WarehouseItemDiscovery |
| `test/warehouse.module.spec.ts` | IntegrationLoader |
| `test/warehouse-item.discovery.spec.ts` | TestLoader |
| `src/decorators/warehouse-item.decorator.ts` | WarehouseItem |

## Entry Points

Start here when exploring this area:

- **`WarehouseItem`** (Function) — `src/decorators/warehouse-item.decorator.ts:14`
- **`WarehouseService`** (Class) — `src/warehouse.service.ts:17`
- **`WarehouseExplorer`** (Class) — `src/warehouse.explorer.ts:23`
- **`WarehouseLoaderRegistry`** (Class) — `src/internal/warehouse-loader.registry.ts:10`
- **`WarehouseItemDiscovery`** (Class) — `src/internal/warehouse-item.discovery.ts:22`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `WarehouseService` | Class | `src/warehouse.service.ts` | 17 |
| `WarehouseExplorer` | Class | `src/warehouse.explorer.ts` | 23 |
| `WarehouseLoaderRegistry` | Class | `src/internal/warehouse-loader.registry.ts` | 10 |
| `WarehouseItemDiscovery` | Class | `src/internal/warehouse-item.discovery.ts` | 22 |
| `WarehouseItem` | Function | `src/decorators/warehouse-item.decorator.ts` | 14 |
| `IntegrationLoader` | Class | `test/warehouse.module.spec.ts` | 7 |
| `TestLoader` | Class | `test/warehouse.explorer.spec.ts` | 9 |
| `FailingLoader` | Class | `test/warehouse.explorer.spec.ts` | 25 |
| `RefreshingLoader` | Class | `test/warehouse.explorer.spec.ts` | 32 |
| `TestLoader` | Class | `test/warehouse-item.discovery.spec.ts` | 4 |
| `createService` | Function | `test/warehouse.service.spec.ts` | 8 |
| `createExplorer` | Function | `test/warehouse.explorer.spec.ts` | 45 |

## How to Explore

1. `gitnexus_context({name: "WarehouseItem"})` — see callers and callees
2. `gitnexus_query({query: "test"})` — find related execution flows
3. Read key files listed above for implementation details
