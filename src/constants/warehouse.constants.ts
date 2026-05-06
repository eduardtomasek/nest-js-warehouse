/**
 * Shared tokens used by the warehouse module.
 * They exist so decorators and providers can refer to the same metadata
 * and options keys without using string literals.
 */
export const WAREHOUSE_OPTIONS = Symbol('WAREHOUSE_OPTIONS');
export const WAREHOUSE_ITEM_METADATA = Symbol('WAREHOUSE_ITEM_METADATA');
