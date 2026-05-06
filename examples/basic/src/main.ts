/**
 * Example entry point for reading warehouse data after bootstrap.
 * It creates a Nest application context, reads the loaded country map,
 * and then closes the app so the example can run as a script.
 */
import { NestFactory } from '@nestjs/core';
import { WarehouseService } from 'nest-js-warehouse';
import { AppModule } from './app.module';
import { Country } from './countries.loader';

/**
 * Runs the example application context and reads one warehouse item.
 * It demonstrates that warehouse values are available after Nest bootstrap.
 * The context is closed after the read so the example process exits.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const warehouse = app.get(WarehouseService);
  const countries = warehouse.get<Map<string, Country>>('countries');

  console.log(countries.get('CZ'));

  await app.close();
}

void bootstrap();
