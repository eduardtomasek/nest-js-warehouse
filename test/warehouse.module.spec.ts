import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WarehouseItem } from '../src/decorators/warehouse-item.decorator';
import { WAREHOUSE_OPTIONS } from '../src/constants/warehouse.constants';
import { WarehouseModule } from '../src/warehouse.module';
import { WarehouseService } from '../src/warehouse.service';

@Injectable()
class IntegrationLoader {
  @WarehouseItem({ key: 'countries' })
  loadCountries() {
    return { CZ: 'Czech Republic' };
  }
}

describe('WarehouseModule', () => {
  it('creates a module with forRoot options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WarehouseModule.forRoot({ freezeValues: false })],
    }).compile();

    expect(moduleRef.get(WAREHOUSE_OPTIONS)).toEqual({
      freezeValues: false,
    });
  });

  it('injects dependencies into forRootAsync useFactory', async () => {
    const token = Symbol('dependency');
    const injectedValues: string[] = [];

    @Module({
      providers: [{ provide: token, useValue: 'ready' }],
      exports: [token],
    })
    class DependencyModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [
        WarehouseModule.forRootAsync({
          imports: [DependencyModule],
          inject: [token],
          useFactory: (dependency: string) => ({
            beforeInit: () => {
              injectedValues.push(dependency);
            },
          }),
        }),
      ],
    }).compile();

    const options = moduleRef.get(WAREHOUSE_OPTIONS);

    options.beforeInit();

    expect(injectedValues).toEqual(['ready']);
  });

  it('makes WarehouseService injectable from the module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WarehouseModule.forRoot()],
    }).compile();

    expect(moduleRef.get(WarehouseService)).toBeInstanceOf(WarehouseService);
  });

  it('loads decorated warehouse items during Nest application bootstrap', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WarehouseModule.forRoot()],
      providers: [IntegrationLoader],
    }).compile();

    await moduleRef.init();

    const warehouse = moduleRef.get(WarehouseService);

    expect(warehouse.isReady()).toBe(true);
    expect(warehouse.get('countries')).toEqual({ CZ: 'Czech Republic' });

    await moduleRef.close();
  });
});
