import { Resolver, Query, Mutation, Subscription, Args } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { TelemetryService } from './telemetry.service';
import { TelemetryEntity } from './entities/telemetry.entity';
import { CreateTelemetryInput } from './dto/create-telemetry.input';
import { BatchTelemetryInput } from './dto/batch-telemetry.input';
import { BatchResult } from './entities/batch-result.entity';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PUB_SUB } from '../pubsub/pubsub.module';

@Resolver(() => TelemetryEntity)
export class TelemetryResolver {
  constructor(
    private readonly telemetryService: TelemetryService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [TelemetryEntity], { name: 'telemetry' })
  async getTelemetry(
    @Args('carId') carId: string,
    @Args('limit', { defaultValue: 100 }) limit: number,
  ): Promise<TelemetryEntity[]> {
    return this.telemetryService.findByCarId(carId, limit);
  }

  @Query(() => TelemetryEntity, { name: 'latestReading', nullable: true })
  async getLatestReading(@Args('carId') carId: string): Promise<TelemetryEntity | null> {
    return this.telemetryService.findLatest(carId);
  }

  @Mutation(() => TelemetryEntity)
  @UseGuards(GqlAuthGuard)
  async upsertReading(@Args('input') input: CreateTelemetryInput): Promise<TelemetryEntity> {
    return this.telemetryService.upsert(input);
  }

  @Mutation(() => BatchResult)
  @UseGuards(GqlAuthGuard)
  async batchUpsertReadings(@Args('input') input: BatchTelemetryInput): Promise<BatchResult> {
    return this.telemetryService.batchUpsert(input.readings);
  }

  @Subscription(() => TelemetryEntity, {
    name: 'liveTelemetry',
  })
  subscribeLiveTelemetry(@Args('carId') carId: string) {
    return this.pubSub.asyncIterator(`liveTelemetry.${carId}`);
  }
}
