/**
 * Internal discovery adapter for decorated warehouse loader methods.
 * It scans Nest provider instances, reads @WarehouseItem metadata,
 * and returns loader registrations without executing the loaders.
 */
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import 'reflect-metadata';
import { WAREHOUSE_ITEM_METADATA } from '../constants/warehouse.constants';
import type { WarehouseItemOptions } from '../interfaces/warehouse-item-options.interface';
import type { WarehouseLoader } from './warehouse-loader.registry';

export interface WarehouseItemRegistration {
  key: string | symbol;
  loader: WarehouseLoader;
}

interface ProviderWrapper {
  instance?: unknown;
}

@Injectable()
export class WarehouseItemDiscovery {
  /**
   * Builds the discovery adapter with Nest's metadata scanner.
   * The scanner provides the method names that may carry @WarehouseItem metadata.
   * Nest injects it through DiscoveryModule support.
   */
  constructor(private readonly metadataScanner: MetadataScanner) {}

  /**
   * Scans provider wrappers and returns loader registrations.
   * It reads metadata but never calls the loader methods.
   * WarehouseExplorer uses these registrations during bootstrap.
   */
  discover(providers: ProviderWrapper[]): WarehouseItemRegistration[] {
    const registrations: WarehouseItemRegistration[] = [];

    for (const wrapper of providers) {
      const instance = wrapper.instance;

      if (!instance || typeof instance !== 'object') {
        continue;
      }

      const prototype = Object.getPrototypeOf(instance);

      if (!prototype) {
        continue;
      }

      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const registration = this.discoverMethod(
          instance as Record<string, unknown>,
          methodName,
        );

        if (registration) {
          registrations.push(registration);
        }
      }
    }

    return registrations;
  }

  /**
   * Converts one decorated method into a loader registration.
   * The returned loader preserves the provider instance as its this context.
   * Undecorated or non-function properties are ignored.
   */
  private discoverMethod(
    instance: Record<string, unknown>,
    methodName: string,
  ): WarehouseItemRegistration | undefined {
    const method = instance[methodName];

    if (typeof method !== 'function') {
      return undefined;
    }

    const metadata = Reflect.getMetadata(
      WAREHOUSE_ITEM_METADATA,
      method,
    ) as WarehouseItemOptions | undefined;

    if (!metadata) {
      return undefined;
    }

    return {
      key: metadata.key,
      loader: () => method.call(instance),
    };
  }
}
