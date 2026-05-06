import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WAREHOUSE_OPTIONS } from '../src/constants/warehouse.constants';
import { WarehouseModule } from '../src/warehouse.module';
import { WarehouseService } from '../src/warehouse.service';

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
});
