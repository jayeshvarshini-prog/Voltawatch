import { Module } from '@nestjs/common';
import { CarsResolver } from './cars.resolver';
import { CarsService } from './cars.service';
import { CarsLoader } from './cars.loader';

@Module({
  providers: [CarsResolver, CarsService, CarsLoader],
  exports: [CarsService, CarsLoader],
})
export class CarsModule {}
