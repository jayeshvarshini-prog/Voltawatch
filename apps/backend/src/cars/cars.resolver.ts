import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarEntity } from './entities/car.entity';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => CarEntity)
export class CarsResolver {
  constructor(private readonly carsService: CarsService) {}

  @Query(() => [CarEntity], { name: 'cars' })
  async getCars(): Promise<CarEntity[]> {
    return this.carsService.findAll();
  }

  @Query(() => CarEntity, { name: 'car', nullable: true })
  async getCar(@Args('id') id: string): Promise<CarEntity | null> {
    return this.carsService.findOne(id);
  }

  @Mutation(() => CarEntity)
  @UseGuards(GqlAuthGuard)
  async registerCar(
    @Args('input') input: CreateCarInput,
    @CurrentUser() user: { userId: string },
  ): Promise<CarEntity> {
    input.ownerId = user.userId;
    return this.carsService.create(input);
  }

  @Mutation(() => CarEntity, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async updateCar(
    @Args('id') id: string,
    @Args('input') input: UpdateCarInput,
  ): Promise<CarEntity | null> {
    return this.carsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCar(@Args('id') id: string): Promise<boolean> {
    return this.carsService.delete(id);
  }
}
