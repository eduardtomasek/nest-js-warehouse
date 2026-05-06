/**
 * Public decorator for marking warehouse loader methods.
 * It stores loader metadata on the method with Reflect metadata.
 * Discovery reads this metadata during application bootstrap.
 */
import 'reflect-metadata';
import { WAREHOUSE_ITEM_METADATA } from '../constants/warehouse.constants';
import { WarehouseItemOptions } from '../interfaces/warehouse-item-options.interface';

/**
 * Creates a method decorator that marks a loader as a warehouse item.
 * The method itself is not executed here; only metadata is attached.
 * Warehouse item discovery reads this metadata during bootstrap.
 */
export function WarehouseItem(options: WarehouseItemOptions): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(
      WAREHOUSE_ITEM_METADATA,
      options,
      descriptor.value,
    );
  };
}
