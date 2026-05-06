import { resolveWarehouseModuleOptions } from '../src/internal/warehouse-options';

describe('resolveWarehouseModuleOptions', () => {
  it('resolves default warehouse module options', () => {
    expect(resolveWarehouseModuleOptions({})).toEqual({
      freezeValues: true,
      failOnLoaderError: true,
    });
  });

  it('preserves configured options while filling missing defaults', () => {
    const beforeInit = jest.fn();

    expect(
      resolveWarehouseModuleOptions({
        beforeInit,
        freezeValues: false,
      }),
    ).toEqual({
      beforeInit,
      freezeValues: false,
      failOnLoaderError: true,
    });
  });
});
