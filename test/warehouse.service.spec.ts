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

  it('keeps readiness semantics unchanged for namespaced reads', () => {
    service.set('countries', { code: 'ZA' }, { freeze: false, ns: 'africa' });

    expect(() => service.get('countries', { ns: 'africa' })).toThrow(
      'Warehouse is not initialized yet.',
    );
    expect(service.tryGet('countries', { ns: 'africa' })).toEqual({
      code: 'ZA',
    });
    expect(service.has('countries', { ns: 'africa' })).toBe(true);
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

  it('stores root and namespaced values independently for the same key', () => {
    service.set('countries', { code: 'CZ' }, { freeze: false });
    service.set('countries', { code: 'ZA' }, { freeze: false, ns: 'africa' });
    service.markReady();

    expect(service.get('countries')).toEqual({ code: 'CZ' });
    expect(service.get('countries', { ns: 'africa' })).toEqual({ code: 'ZA' });
  });

  it('uses namespace-aware lookups for tryGet and has', () => {
    service.set('countries', { code: 'CZ' }, { freeze: false });

    expect(service.tryGet('countries', { ns: 'africa' })).toBeUndefined();
    expect(service.has('countries', { ns: 'africa' })).toBe(false);

    service.set('countries', { code: 'ZA' }, { freeze: false, ns: 'africa' });

    expect(service.tryGet('countries', { ns: 'africa' })).toEqual({
      code: 'ZA',
    });
    expect(service.has('countries', { ns: 'africa' })).toBe(true);
    expect(service.tryGet('countries')).toEqual({ code: 'CZ' });
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

  it('rejects namespaced refresh explicitly', async () => {
    await expect(
      service.refresh('countries', { ns: 'africa' }),
    ).rejects.toThrow(
      'Namespaced refresh is not supported without namespaced loader registration: africa',
    );
  });

  it('throws from get when key does not exist', () => {
    service.markReady();

    expect(() => service.get('missing')).toThrow(
      'Warehouse item not found: missing',
    );
  });

  it('throws a namespace-aware error when a namespaced key does not exist', () => {
    service.markReady();

    expect(() => service.get('missing', { ns: 'africa' })).toThrow(
      'Warehouse item not found in namespace "africa": missing',
    );
  });

  it('rejects empty and whitespace-only namespace values', () => {
    expect(() =>
      service.set('countries', [], { freeze: false, ns: '' }),
    ).toThrow('Warehouse namespace must be a non-empty string.');
    expect(() => service.keys({ ns: '   ' })).toThrow(
      'Warehouse namespace must be a non-empty string.',
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

  it('rejects namespaced symbol keys while preserving root symbol keys', () => {
    const symbolKey = Symbol('registry');

    service.set(symbolKey, { code: 'CZ' }, { freeze: false });

    expect(service.tryGet(symbolKey)).toEqual({ code: 'CZ' });
    expect(() =>
      service.set(symbolKey, { code: 'ZA' }, { freeze: false, ns: 'africa' }),
    ).toThrow(
      'Namespaced symbol keys are not supported in the first version: Symbol(registry)',
    );
  });

  it('returns only root keys when keys is called without namespace', () => {
    service.set('countries', []);
    service.set('cities', [], { ns: 'africa' });

    expect(service.keys()).toEqual(['countries']);
  });

  it('returns only keys from the selected namespace', () => {
    service.set('countries', []);
    service.set('cities', [], { ns: 'africa' });
    service.set('rivers', [], { ns: 'africa' });
    service.set('states', [], { ns: 'america' });

    expect(service.keys({ ns: 'africa' })).toEqual(['cities', 'rivers']);
  });

  it('clears only the selected namespace', () => {
    service.set('countries', [], { freeze: false });
    service.set('cities', [], { freeze: false, ns: 'africa' });
    service.set('rivers', [], { freeze: false, ns: 'africa' });
    service.set('states', [], { freeze: false, ns: 'america' });

    service.clear({ ns: 'africa' });

    expect(service.tryGet('countries')).toEqual([]);
    expect(service.tryGet('cities', { ns: 'africa' })).toBeUndefined();
    expect(service.tryGet('rivers', { ns: 'africa' })).toBeUndefined();
    expect(service.tryGet('states', { ns: 'america' })).toEqual([]);
  });

  it('keeps readiness and behaves predictably for missing namespaces', () => {
    service.set('countries', [], { freeze: false });
    service.markReady();

    service.clear({ ns: 'missing' });

    expect(service.isReady()).toBe(true);
    expect(service.keys({ ns: 'missing' })).toEqual([]);
    expect(service.tryGet('countries')).toEqual([]);
  });

  it('clears the store and resets readiness', () => {
    service.set('countries', []);
    service.markReady();

    service.clear();

    expect(service.isReady()).toBe(false);
    expect(service.has('countries')).toBe(false);
  });

  it('keeps root behavior compatible after namespaced writes and clears', () => {
    service.set('countries', ['CZ'], { freeze: false });
    service.set('countries', ['ZA'], { freeze: false, ns: 'africa' });
    service.set('cities', ['Prague'], { freeze: false, ns: 'europe' });
    service.markReady();

    expect(service.get('countries')).toEqual(['CZ']);
    expect(service.has('countries')).toBe(true);
    expect(service.keys()).toEqual(['countries']);

    service.clear({ ns: 'africa' });

    expect(service.get('countries')).toEqual(['CZ']);
    expect(service.has('countries')).toBe(true);
    expect(service.isReady()).toBe(true);

    service.clear();

    expect(service.isReady()).toBe(false);
    expect(service.has('countries')).toBe(false);
    expect(service.keys()).toEqual([]);
  });
});
