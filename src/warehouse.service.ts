/**
 * Public service for reading, writing, and refreshing warehouse values.
 * It owns the in-memory store and delegates loader execution and freeze decisions.
 * Application code injects this service after WarehouseModule is imported.
 */
import { Inject, Injectable } from '@nestjs/common';
import { WAREHOUSE_OPTIONS } from './constants/warehouse.constants';
import type { WarehouseModuleOptions } from './interfaces/warehouse-module-options.interface';
import type { WarehouseSetOptions } from './interfaces/warehouse-set-options.interface';
import { WarehouseFreezePolicy } from './internal/warehouse-freeze-policy';
import { WarehouseLoaderRegistry } from './internal/warehouse-loader.registry';
import {
  resolveWarehouseModuleOptions,
  type ResolvedWarehouseModuleOptions,
} from './internal/warehouse-options';

@Injectable()
export class WarehouseService {
  private readonly store = new Map<string | symbol, unknown>();
  private ready = false;
  private readonly resolvedOptions: ResolvedWarehouseModuleOptions;
  private readonly freezePolicy: WarehouseFreezePolicy;

  /**
   * Builds the service with its loader registry and module options.
   * Options are resolved once here and reused by the freeze policy.
   * Nest injects these dependencies from WarehouseModule.
   */
  constructor(
    private readonly loaderRegistry: WarehouseLoaderRegistry,
    @Inject(WAREHOUSE_OPTIONS)
    private readonly options: WarehouseModuleOptions = {},
  ) {
    this.resolvedOptions = resolveWarehouseModuleOptions(this.options);
    this.freezePolicy = new WarehouseFreezePolicy(this.resolvedOptions);
  }

  /**
   * Writes a value into the warehouse under one key.
   * This is the manual write path; loader-managed writes also pass through it.
   * The freeze policy is applied here so all stored values follow one rule.
   */
  set<T>(
    key: string | symbol,
    value: T,
    options: WarehouseSetOptions = {},
  ): void {
    this.store.set(key, this.freezePolicy.apply(value, options));
  }

  /**
   * Reads a required value after the warehouse is ready.
   * It protects callers from reading before bootstrap has completed.
   * Missing keys are treated as configuration or loader errors.
   */
  get<T>(key: string | symbol): T {
    if (!this.ready) {
      throw new Error('Warehouse is not initialized yet.');
    }

    if (!this.store.has(key)) {
      throw new Error(`Warehouse item not found: ${String(key)}`);
    }

    return this.store.get(key) as T;
  }

  /**
   * Reads an optional value without throwing when the key is absent.
   * This is useful for optional registry entries or manual checks.
   * It does not enforce readiness because callers choose the safe path explicitly.
   */
  tryGet<T>(key: string | symbol): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  /**
   * Reloads one loader-managed warehouse item by key.
   * The loader lifecycle registry executes the loader and commits only on success.
   * The committed value goes through set(), so freeze behavior stays consistent.
   */
  async refresh<T>(key: string | symbol): Promise<T> {
    return this.loaderRegistry.load<T>(key, (value) => {
      this.set(key, value);
    });
  }

  /**
   * Checks whether a key currently exists in the store.
   * This is a lightweight lookup used by callers that want to branch explicitly.
   * It reports store contents only; it does not check whether a loader exists.
   */
  has(key: string | symbol): boolean {
    return this.store.has(key);
  }

  /**
   * Returns the keys currently stored in the warehouse.
   * This helps callers inspect loaded or manually inserted entries.
   * The returned array is a snapshot, not a live view of the store.
   */
  keys(): Array<string | symbol> {
    return Array.from(this.store.keys());
  }

  /**
   * Reports whether bootstrap loading has completed.
   * WarehouseExplorer flips this flag after all initial loader work is done.
   * Callers can use it for diagnostics or readiness checks.
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Marks the warehouse as ready for required reads.
   * This is called by the bootstrap coordinator after initial loading.
   * It is public for tests and advanced manual orchestration.
   */
  markReady(): void {
    this.ready = true;
  }

  /**
   * Clears all stored values and resets readiness.
   * This is mainly useful for tests or explicit reinitialization flows.
   * It does not remove registered loaders from the lifecycle registry.
   */
  clear(): void {
    this.store.clear();
    this.ready = false;
  }
}
