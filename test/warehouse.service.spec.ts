import { WarehouseService } from '../src/warehouse.service';
import { WarehouseLoaderRegistry } from '../src/internal/warehouse-loader.registry';
import { WarehouseModuleOptions } from '../src/interfaces/warehouse-module-options.interface';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let loaderRegistry: WarehouseLoaderRegistry;

  function createService(options: WarehouseModuleOptions = {}) {
    loaderRegistry = new WarehouseLoaderRegistry();
    service = new WarehouseService(loaderRegistry, options);
  }

  beforeEach(() => {
    createService();
  });

  it('is not ready by default', () => {
    expect(service.isReady()).toBe(false);
  });

  it('throws when get is called before markReady', () => {
    service.set('countries', new Map());

    expect(() => service.get('countries')).toThrow(
      'Warehouse is not initialized yet.',
    );
  });

  it('returns a stored value after markReady', () => {
    const value = { code: 'CZ' };

    service.set('country', value, { freeze: false });
    service.markReady();

    expect(service.get('country')).toBe(value);
  });

  it('freezes values set manually by default', () => {
    const value = { code: 'CZ' };

    service.set('country', value);

    expect(Object.isFrozen(service.tryGet('country'))).toBe(true);
  });

  it('can skip freezing for a manual set call', () => {
    const value = { code: 'CZ' };

    service.set('country', value, { freeze: false });

    expect(Object.isFrozen(service.tryGet('country'))).toBe(false);
  });

  it('can force freezing for a manual set call when global freeze is false', () => {
    createService({ freezeValues: false });

    service.set('country', { code: 'CZ' }, { freeze: true });

    expect(Object.isFrozen(service.tryGet('country'))).toBe(true);
  });

  it('uses the global freeze option for manual set by default', () => {
    createService({ freezeValues: false });

    service.set('country', { code: 'CZ' });

    expect(Object.isFrozen(service.tryGet('country'))).toBe(false);
  });

  it('returns undefined from tryGet when key does not exist', () => {
    expect(service.tryGet('missing')).toBeUndefined();
  });

  it('refreshes a key from its registered loader', async () => {
    loaderRegistry.register('countries', () => ['CZ']);

    const value = await service.refresh<string[]>('countries');

    expect(value).toEqual(['CZ']);
    expect(service.tryGet('countries')).toEqual(['CZ']);
  });

  it('preserves the old value when refresh fails', async () => {
    service.set('countries', ['CZ'], { freeze: false });
    loaderRegistry.register('countries', () => {
      throw new Error('refresh failed');
    });

    await expect(service.refresh('countries')).rejects.toThrow(
      'refresh failed',
    );
    expect(service.tryGet('countries')).toEqual(['CZ']);
  });

  it('throws when refreshing a key without a registered loader', async () => {
    await expect(service.refresh('missing')).rejects.toThrow(
      'Warehouse loader not found: missing',
    );
  });

  it('throws from get when key does not exist', () => {
    service.markReady();

    expect(() => service.get('missing')).toThrow(
      'Warehouse item not found: missing',
    );
  });

  it('checks whether a key exists', () => {
    service.set('countries', []);

    expect(service.has('countries')).toBe(true);
    expect(service.has('cities')).toBe(false);
  });

  it('returns stored keys', () => {
    const symbolKey = Symbol('registry');

    service.set('countries', []);
    service.set(symbolKey, {});

    expect(service.keys()).toEqual(['countries', symbolKey]);
  });

  it('clears the store and resets readiness', () => {
    service.set('countries', []);
    service.markReady();

    service.clear();

    expect(service.isReady()).toBe(false);
    expect(service.has('countries')).toBe(false);
  });
});
