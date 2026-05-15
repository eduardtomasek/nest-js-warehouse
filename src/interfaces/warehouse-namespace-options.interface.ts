/**
 * Public options for addressing one warehouse namespace.
 * When omitted, WarehouseService methods operate on the root namespace.
 */
export interface WarehouseNamespaceOptions {
  ns?: string;
}
