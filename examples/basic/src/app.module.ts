/**
 * Example Nest module for the basic demo app.
 * It shows where WarehouseModule is plugged into an application.
 * The module registers the warehouse and the example loader during bootstrap.
 */
import { Module } from '@nestjs/common';
import { WarehouseModule } from 'nest-js-warehouse';
import { CountriesWarehouseLoader } from './countries.loader';

@Module({
  imports: [
    WarehouseModule.forRoot({
      freezeValues: true,
      failOnLoaderError: true,
    }),
  ],
  providers: [CountriesWarehouseLoader],
})
export class AppModule {}
