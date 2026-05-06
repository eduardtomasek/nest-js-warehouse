/**
 * Public Nest module for installing the warehouse into an application.
 * It wires DiscoveryModule, the public WarehouseService, and internal lifecycle providers.
 * Applications import this module through forRoot or forRootAsync.
 */
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { WAREHOUSE_OPTIONS } from './constants/warehouse.constants';
import {
  WarehouseModuleAsyncOptions,
  WarehouseModuleOptions,
} from './interfaces/warehouse-module-options.interface';
import { WarehouseLoaderRegistry } from './internal/warehouse-loader.registry';
import { WarehouseExplorer } from './warehouse.explorer';
import { WarehouseItemDiscovery } from './internal/warehouse-item.discovery';
import { WarehouseService } from './warehouse.service';

@Global()
@Module({})
export class WarehouseModule {
  /**
   * Registers the warehouse with static options.
   * Applications use this when options are known at module declaration time.
   * It wires the public service and all internal lifecycle providers.
   */
  static forRoot(options: WarehouseModuleOptions = {}): DynamicModule {
    return {
      module: WarehouseModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        WarehouseService,
        WarehouseItemDiscovery,
        WarehouseLoaderRegistry,
        WarehouseExplorer,
        {
          provide: WAREHOUSE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [WarehouseService],
    };
  }

  /**
   * Registers the warehouse with options created by injected providers.
   * Applications use this when setup must wait for another Nest module or service.
   * The produced options feed the same internal providers as forRoot().
   */
  static forRootAsync(options: WarehouseModuleAsyncOptions): DynamicModule {
    return {
      module: WarehouseModule,
      global: true,
      imports: [DiscoveryModule, ...(options.imports ?? [])],
      providers: [
        WarehouseService,
        WarehouseItemDiscovery,
        WarehouseLoaderRegistry,
        WarehouseExplorer,
        {
          provide: WAREHOUSE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
      ],
      exports: [WarehouseService],
    };
  }
}
