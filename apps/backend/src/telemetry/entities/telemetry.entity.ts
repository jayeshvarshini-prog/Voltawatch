import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class TelemetryEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  carId!: string;

  @Field()
  timestamp!: Date;

  @Field(() => Float)
  batteryVoltage!: number;

  @Field(() => Float)
  batteryPercentage!: number;

  @Field(() => Float)
  batteryTempCelsius!: number;

  @Field(() => Float)
  motorTempCelsius!: number;

  @Field(() => Int)
  rpm!: number;

  @Field(() => Float)
  cabinTempCelsius!: number;

  @Field(() => Int)
  currentMileage!: number;

  @Field(() => Float)
  speedKmh!: number;

  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;

  @Field(() => [String])
  faultCodes!: string[];

  @Field()
  isCharging!: boolean;

  @Field(() => Float, { nullable: true })
  chargingPowerKw?: number | null;

  @Field()
  createdAt!: Date;
}
