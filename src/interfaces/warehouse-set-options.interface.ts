/**
 * Public options for manual WarehouseService.set calls.
 * It lets a caller override the global freeze setting for one write.
 * This is used when callers build mutable draft data before storing it.
 */
export interface WarehouseSetOptions {
  freeze?: boolean;
}
