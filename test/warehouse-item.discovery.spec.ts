import { MetadataScanner } from '@nestjs/core';
import { WarehouseItem } from '../src/decorators/warehouse-item.decorator';
import { WarehouseItemDiscovery } from '../src/internal/warehouse-item.discovery';

class TestLoader {
  calls = 0;

  @WarehouseItem({ key: 'countries' })
  loadCountries() {
    this.calls += 1;

    return ['CZ'];
  }
}

class MixedLoader {
  calls = 0;

  loadUndecorated() {
    this.calls += 1;

    return ['US'];
  }
}

describe('WarehouseItemDiscovery', () => {
  it('discovers decorated warehouse item loaders without executing them', () => {
    const loader = new TestLoader();
    const discovery = new WarehouseItemDiscovery(new MetadataScanner());

    const registrations = discovery.discover([{ instance: loader }]);

    expect(registrations).toHaveLength(1);
    expect(registrations[0]?.key).toBe('countries');
    expect(loader.calls).toBe(0);
  });

  it('ignores undecorated methods', () => {
    const loader = new MixedLoader();
    const discovery = new WarehouseItemDiscovery(new MetadataScanner());

    const registrations = discovery.discover([{ instance: loader }]);

    expect(registrations).toEqual([]);
    expect(loader.calls).toBe(0);
  });
});
