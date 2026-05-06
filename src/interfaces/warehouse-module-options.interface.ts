/**
 * Public module configuration for the warehouse.
 * These options control bootstrap waiting, freeze behavior, and loader errors.
 * WarehouseModule receives them and internal modules resolve defaults from them.
 */
import { ModuleMetadata } from '@nestjs/common';

export interface WarehouseModuleOptions {
  beforeInit?: () => Promise<void> | void;
  freezeValues?: boolean;
  failOnLoaderError?: boolean;
}

export interface WarehouseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => WarehouseModuleOptions | Promise<WarehouseModuleOptions>;
}
