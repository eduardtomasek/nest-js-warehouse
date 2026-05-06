/**
 * Internal lifecycle registry for loader-managed warehouse items.
 * It stores loader functions by key and executes them for bootstrap and refresh.
 * Values are committed only after a loader finishes successfully.
 */
import { Injectable } from '@nestjs/common';

export type WarehouseLoader = () => Promise<unknown> | unknown;

@Injectable()
export class WarehouseLoaderRegistry {
  private readonly loaders = new Map<string | symbol, WarehouseLoader>();

  /**
   * Registers a loader function for one warehouse key.
   * Discovery calls this during bootstrap for every decorated method.
   * Later refresh calls use the same registered loader.
   */
  register(key: string | symbol, loader: WarehouseLoader): void {
    this.loaders.set(key, loader);
  }

  /**
   * Executes one registered loader and commits the value after success.
   * The commit callback is supplied by WarehouseService so storage remains there.
   * If the loader is missing or fails, no commit happens.
   */
  async load<T>(
    key: string | symbol,
    commit: (value: T) => void,
  ): Promise<T> {
    const loader = this.loaders.get(key);

    if (!loader) {
      throw new Error(`Warehouse loader not found: ${String(key)}`);
    }

    const value = (await loader()) as T;

    commit(value);

    return value;
  }
}
