/**
 * Example warehouse loader for static country data.
 * It exists to show how an app provider marks one method with @WarehouseItem.
 * During bootstrap, the warehouse discovers this method and stores its result.
 */
import { Injectable } from '@nestjs/common';
import { WarehouseItem } from 'nest-js-warehouse';

export interface Country {
  code: string;
  name: string;
}

@Injectable()
export class CountriesWarehouseLoader {
  /**
   * Provides the example country lookup data.
   * The decorator marks the method for warehouse discovery.
   * Bootstrap stores the returned map under the countries key.
   */
  @WarehouseItem({ key: 'countries' })
  loadCountries() {
    const countries: Country[] = [
      { code: 'CZ', name: 'Czech Republic' },
      { code: 'US', name: 'United States' },
    ];

    return new Map(countries.map((country) => [country.code, country]));
  }
}
