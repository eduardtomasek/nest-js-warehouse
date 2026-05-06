import * as publicSurface from '../src';

describe('public package surface', () => {
  it('exports the intended user-facing modules', () => {
    expect(publicSurface.WarehouseModule).toBeDefined();
    expect(publicSurface.WarehouseService).toBeDefined();
    expect(publicSurface.WarehouseItem).toBeDefined();
    expect(publicSurface.WAREHOUSE_OPTIONS).toBeDefined();
    expect(publicSurface.WAREHOUSE_ITEM_METADATA).toBeDefined();
  });

  it('does not export internal lifecycle modules', () => {
    expect('WarehouseLoaderRegistry' in publicSurface).toBe(false);
    expect('WarehouseItemDiscovery' in publicSurface).toBe(false);
    expect('WarehouseFreezePolicy' in publicSurface).toBe(false);
    expect('resolveWarehouseModuleOptions' in publicSurface).toBe(false);
  });
});
