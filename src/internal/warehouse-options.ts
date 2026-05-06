/**
 * Internal resolver for warehouse module options.
 * It centralizes defaults so bootstrap and manual writes share one interpretation.
 * Public forRoot and forRootAsync options are passed through this resolver.
 */
import type { WarehouseModuleOptions } from '../interfaces/warehouse-module-options.interface';

export type ResolvedWarehouseModuleOptions = WarehouseModuleOptions &
  Required<Pick<WarehouseModuleOptions, 'freezeValues' | 'failOnLoaderError'>>;

/**
 * Resolves user module options into the internal complete option shape.
 * It provides defaults once so other modules do not duplicate fallback logic.
 * The result is used by bootstrap coordination and warehouse storage.
 */
export function resolveWarehouseModuleOptions(
  options: WarehouseModuleOptions = {},
): ResolvedWarehouseModuleOptions {
  return {
    freezeValues: true,
    failOnLoaderError: true,
    ...options,
  };
}
