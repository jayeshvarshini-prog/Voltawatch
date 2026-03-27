import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class CarEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  ownerId!: string;

  @Field()
  vin!: string;

  @Field()
  model!: string;

  @Field(() => Int)
  year!: number;

  @Field(() => Int)
  currentMileage!: number;

  @Field(() => Float)
  batteryHealthPercentage!: number;

  @Field(() => Int)
  estimatedRangeKm!: number;

  @Field({ nullable: true })
  lastServiceDate?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
