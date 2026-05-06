import { WarehouseFreezePolicy } from '../src/internal/warehouse-freeze-policy';
import { resolveWarehouseModuleOptions } from '../src/internal/warehouse-options';

describe('WarehouseFreezePolicy', () => {
  it('freezes plain objects by default', () => {
    const policy = new WarehouseFreezePolicy(
      resolveWarehouseModuleOptions({}),
    );
    const value = { code: 'CZ' };

    const result = policy.apply(value);

    expect(result).toBe(value);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('uses the global freeze option by default', () => {
    const policy = new WarehouseFreezePolicy(
      resolveWarehouseModuleOptions({ freezeValues: false }),
    );
    const value = { code: 'CZ' };

    const result = policy.apply(value);

    expect(result).toBe(value);
    expect(Object.isFrozen(result)).toBe(false);
  });

  it('can skip freezing for one value', () => {
    const policy = new WarehouseFreezePolicy(
      resolveWarehouseModuleOptions({}),
    );
    const value = { code: 'CZ' };

    const result = policy.apply(value, { freeze: false });

    expect(result).toBe(value);
    expect(Object.isFrozen(result)).toBe(false);
  });

  it('can force freezing for one value', () => {
    const policy = new WarehouseFreezePolicy(
      resolveWarehouseModuleOptions({ freezeValues: false }),
    );
    const value = { code: 'CZ' };

    const result = policy.apply(value, { freeze: true });

    expect(result).toBe(value);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it.each([
    ['Map', new Map([['CZ', 'Czech Republic']])],
    ['Set', new Set(['CZ'])],
    ['Date', new Date('2026-05-06T00:00:00.000Z')],
    ['string', 'CZ'],
    ['number', 1],
    ['boolean', true],
    ['null', null],
  ])('leaves %s values unchanged', (_label, value) => {
    const policy = new WarehouseFreezePolicy(
      resolveWarehouseModuleOptions({}),
    );

    expect(policy.apply(value)).toBe(value);
  });
});
