import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { WarehouseItem } from '../src/decorators/warehouse-item.decorator';
import { WarehouseModuleOptions } from '../src/interfaces/warehouse-module-options.interface';
import { WarehouseLoaderRegistry } from '../src/internal/warehouse-loader.registry';
import { WarehouseExplorer } from '../src/warehouse.explorer';
import { WarehouseItemDiscovery } from '../src/internal/warehouse-item.discovery';
import { WarehouseService } from '../src/warehouse.service';

@Injectable()
class TestLoader {
  calls: string[];

  constructor(calls: string[]) {
    this.calls = calls;
  }

  @WarehouseItem({ key: 'countries' })
  loadCountries() {
    this.calls.push('loader');

    return { code: 'CZ' };
  }
}

class FailingLoader {
  @WarehouseItem({ key: 'failing' })
  loadFailing() {
    throw new Error('loader failed');
  }
}

class RefreshingLoader {
  value = 'CZ';

  @WarehouseItem({ key: 'countries' })
  loadCountries() {
    if (this.value === 'FAIL') {
      throw new Error('refresh failed');
    }

    return { code: this.value };
  }
}

function createExplorer(
  providers: unknown[],
  options: WarehouseModuleOptions = {},
) {
  const loaderRegistry = new WarehouseLoaderRegistry();
  const warehouse = new WarehouseService(loaderRegistry, options);
  const discoveryService = {
    getProviders: jest.fn(() =>
      providers.map((provider) => ({ instance: provider })),
    ),
  } as unknown as DiscoveryService;

  const explorer = new WarehouseExplorer(
    discoveryService,
    new WarehouseItemDiscovery(new MetadataScanner()),
    warehouse,
    loaderRegistry,
    options,
  );

  return { explorer, warehouse, discoveryService };
}

describe('WarehouseExplorer', () => {
  it('finds a decorated method, calls it, and stores the result', async () => {
    const calls: string[] = [];
    const loader = new TestLoader(calls);
    const { explorer, warehouse, discoveryService } = createExplorer([loader]);

    await explorer.onApplicationBootstrap();

    expect(discoveryService.getProviders).toHaveBeenCalled();
    expect(calls).toEqual(['loader']);
    expect(warehouse.get('countries')).toEqual({ code: 'CZ' });
  });

  it('calls beforeInit before loaders', async () => {
    const calls: string[] = [];
    const loader = new TestLoader(calls);
    const { explorer } = createExplorer([loader], {
      beforeInit: () => {
        calls.push('beforeInit');
      },
    });

    await explorer.onApplicationBootstrap();

    expect(calls).toEqual(['beforeInit', 'loader']);
  });

  it('rethrows loader errors when failOnLoaderError is true', async () => {
    const { explorer, warehouse } = createExplorer([new FailingLoader()], {
      failOnLoaderError: true,
    });

    await expect(explorer.onApplicationBootstrap()).rejects.toThrow(
      'loader failed',
    );
    expect(warehouse.isReady()).toBe(false);
  });

  it('logs and continues when failOnLoaderError is false', async () => {
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { explorer, warehouse } = createExplorer([new FailingLoader()], {
      failOnLoaderError: false,
    });

    await explorer.onApplicationBootstrap();

    expect(loggerSpy).toHaveBeenCalledWith(
      'Warehouse loader failed for key failing',
      expect.any(String),
    );
    expect(warehouse.isReady()).toBe(true);

    loggerSpy.mockRestore();
  });

  it('freezes plain objects by default', async () => {
    const { explorer, warehouse } = createExplorer([new TestLoader([])]);

    await explorer.onApplicationBootstrap();

    expect(Object.isFrozen(warehouse.get('countries'))).toBe(true);
  });

  it('does not freeze plain objects when freezeValues is false', async () => {
    const { explorer, warehouse } = createExplorer([new TestLoader([])], {
      freezeValues: false,
    });

    await explorer.onApplicationBootstrap();

    expect(Object.isFrozen(warehouse.get('countries'))).toBe(false);
  });

  it('refreshes a registered warehouse item by key', async () => {
    const loader = new RefreshingLoader();
    const { explorer, warehouse } = createExplorer([loader]);

    await explorer.onApplicationBootstrap();

    expect(warehouse.get('countries')).toEqual({ code: 'CZ' });

    loader.value = 'US';

    const value = await warehouse.refresh('countries');

    expect(value).toEqual({ code: 'US' });
    expect(warehouse.get('countries')).toEqual({ code: 'US' });
  });

  it('preserves the previous value when refresh by key fails', async () => {
    const loader = new RefreshingLoader();
    const { explorer, warehouse } = createExplorer([loader]);

    await explorer.onApplicationBootstrap();

    loader.value = 'FAIL';

    await expect(warehouse.refresh('countries')).rejects.toThrow(
      'refresh failed',
    );
    expect(warehouse.get('countries')).toEqual({ code: 'CZ' });
  });
});
