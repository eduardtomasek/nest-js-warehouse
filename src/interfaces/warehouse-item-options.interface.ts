/**
 * Public options for one decorated warehouse item.
 * The key is the name used to store, read, and refresh the loader result.
 * WarehouseItem passes this shape into discovery through method metadata.
 */
export interface WarehouseItemOptions {
  key: string | symbol;
}
