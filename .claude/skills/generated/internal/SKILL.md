---
name: internal
description: "Skill for the Internal area of nest-js-warehouse. 14 symbols across 7 files."
---

# Internal

14 symbols | 7 files | Cohesion: 85%

## When to Use

- Working with code in `src/`
- Understanding how freezeValue, resolveWarehouseModuleOptions, WarehouseFreezePolicy work
- Modifying internal-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/warehouse.service.ts` | set, refresh, markReady, constructor |
| `src/warehouse.explorer.ts` | loadRegisteredWarehouseItem, onApplicationBootstrap |
| `src/internal/warehouse-loader.registry.ts` | load, register |
| `src/internal/warehouse-freeze-policy.ts` | apply, WarehouseFreezePolicy |
| `src/internal/warehouse-item.discovery.ts` | discover, discoverMethod |
| `src/internal/freeze.util.ts` | freezeValue |
| `src/internal/warehouse-options.ts` | resolveWarehouseModuleOptions |

## Entry Points

Start here when exploring this area:

- **`freezeValue`** (Function) — `src/internal/freeze.util.ts:5`
- **`resolveWarehouseModuleOptions`** (Function) — `src/internal/warehouse-options.ts:15`
- **`WarehouseFreezePolicy`** (Class) — `src/internal/warehouse-freeze-policy.ts:9`
- **`set`** (Method) — `src/warehouse.service.ts:42`
- **`refresh`** (Method) — `src/warehouse.service.ts:81`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `WarehouseFreezePolicy` | Class | `src/internal/warehouse-freeze-policy.ts` | 9 |
| `freezeValue` | Function | `src/internal/freeze.util.ts` | 5 |
| `resolveWarehouseModuleOptions` | Function | `src/internal/warehouse-options.ts` | 15 |
| `set` | Method | `src/warehouse.service.ts` | 42 |
| `refresh` | Method | `src/warehouse.service.ts` | 81 |
| `loadRegisteredWarehouseItem` | Method | `src/warehouse.explorer.ts` | 70 |
| `load` | Method | `src/internal/warehouse-loader.registry.ts` | 27 |
| `apply` | Method | `src/internal/warehouse-freeze-policy.ts` | 22 |
| `markReady` | Method | `src/warehouse.service.ts` | 119 |
| `onApplicationBootstrap` | Method | `src/warehouse.explorer.ts` | 45 |
| `register` | Method | `src/internal/warehouse-loader.registry.ts` | 18 |
| `discover` | Method | `src/internal/warehouse-item.discovery.ts` | 35 |
| `discoverMethod` | Method | `src/internal/warehouse-item.discovery.ts` | 73 |
| `constructor` | Method | `src/warehouse.service.ts` | 28 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OnApplicationBootstrap → FreezeValue` | cross_community | 6 |
| `OnApplicationBootstrap → Load` | cross_community | 4 |
| `OnApplicationBootstrap → DiscoverMethod` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "freezeValue"})` — see callers and callees
2. `gitnexus_query({query: "internal"})` — find related execution flows
3. Read key files listed above for implementation details
