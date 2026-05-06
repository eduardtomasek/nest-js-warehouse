import { WarehouseLoaderRegistry } from '../src/internal/warehouse-loader.registry';

describe('WarehouseLoaderRegistry', () => {
  it('loads a registered warehouse item and commits the value', async () => {
    const registry = new WarehouseLoaderRegistry();
    const commit = jest.fn();

    registry.register('countries', () => ['CZ']);

    const value = await registry.load('countries', commit);

    expect(value).toEqual(['CZ']);
    expect(commit).toHaveBeenCalledWith(['CZ']);
  });

  it('throws when loading a key without a registered loader', async () => {
    const registry = new WarehouseLoaderRegistry();
    const commit = jest.fn();

    await expect(registry.load('missing', commit)).rejects.toThrow(
      'Warehouse loader not found: missing',
    );
    expect(commit).not.toHaveBeenCalled();
  });

  it('does not commit when the loader fails', async () => {
    const registry = new WarehouseLoaderRegistry();
    const commit = jest.fn();

    registry.register('countries', () => {
      throw new Error('loader failed');
    });

    await expect(registry.load('countries', commit)).rejects.toThrow(
      'loader failed',
    );
    expect(commit).not.toHaveBeenCalled();
  });
});
