/**
 * Internal policy for deciding whether warehouse values are frozen.
 * It combines global module options with per-write set options.
 * WarehouseService uses this policy for manual writes, bootstrap loads, and refresh.
 */
import type { WarehouseSetOptions } from '../interfaces/warehouse-set-options.interface';
import { freezeValue } from './freeze.util';
import type { ResolvedWarehouseModuleOptions } from './warehouse-options';

export class WarehouseFreezePolicy {
  /**
   * Builds the policy from already resolved module options.
   * This keeps default handling outside the policy and lets it focus on decisions.
   * WarehouseService creates one policy for its store writes.
   */
  constructor(private readonly options: ResolvedWarehouseModuleOptions) {}

  /**
   * Applies the effective freeze rule to one value.
   * Per-write options override the global module default.
   * The low-level freeze helper decides which runtime values are safe to freeze.
   */
  apply<T>(value: T, setOptions: WarehouseSetOptions = {}): T {
    const shouldFreeze = setOptions.freeze ?? this.options.freezeValues;

    return shouldFreeze ? freezeValue(value) : value;
  }
}
