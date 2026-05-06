/**
 * Bootstrap coordinator for the warehouse module.
 * It waits for beforeInit, asks discovery for decorated loaders, registers them,
 * runs initial loads, and marks the warehouse ready when bootstrap is complete.
 */
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { WAREHOUSE_OPTIONS } from './constants/warehouse.constants';
import type { WarehouseModuleOptions } from './interfaces/warehouse-module-options.interface';
import { WarehouseLoaderRegistry } from './internal/warehouse-loader.registry';
import {
  resolveWarehouseModuleOptions,
  type ResolvedWarehouseModuleOptions,
} from './internal/warehouse-options';
import { WarehouseItemDiscovery } from './internal/warehouse-item.discovery';
import { WarehouseService } from './warehouse.service';

@Injectable()
export class WarehouseExplorer implements OnApplicationBootstrap {
  private readonly logger = new Logger(WarehouseExplorer.name);

  /**
   * Builds the bootstrap coordinator from Nest discovery and warehouse internals.
   * The explorer keeps orchestration here while discovery, loading, and storage
   * stay behind their own internal modules.
   */
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly warehouseItemDiscovery: WarehouseItemDiscovery,
    private readonly warehouse: WarehouseService,
    private readonly loaderRegistry: WarehouseLoaderRegistry,
    @Inject(WAREHOUSE_OPTIONS)
    private readonly options: WarehouseModuleOptions = {},
  ) {}

  /**
   * Runs the warehouse bootstrap process at Nest application bootstrap time.
   * It waits for the optional beforeInit hook, discovers loader methods,
   * registers them, performs initial refreshes, and marks the store ready.
   */
  async onApplicationBootstrap(): Promise<void> {
    const options = resolveWarehouseModuleOptions(this.options);

    await options.beforeInit?.();

    const registrations = this.warehouseItemDiscovery.discover(
      this.discoveryService.getProviders(),
    );

    for (const registration of registrations) {
      this.loaderRegistry.register(registration.key, registration.loader);
    }

    for (const registration of registrations) {
      await this.loadRegisteredWarehouseItem(registration.key, options);
    }

    this.warehouse.markReady();
  }

  /**
   * Loads one registered warehouse item during bootstrap.
   * It keeps bootstrap error policy in the coordinator while refresh logic
   * stays inside WarehouseService and the loader lifecycle registry.
   */
  private async loadRegisteredWarehouseItem(
    key: string | symbol,
    options: ResolvedWarehouseModuleOptions,
  ): Promise<void> {
    try {
      await this.warehouse.refresh(key);
    } catch (error) {
      if (options.failOnLoaderError) {
        throw error;
      }

      this.logger.error(
        `Warehouse loader failed for key ${String(key)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
