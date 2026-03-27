import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min, Max, IsBoolean, IsOptional, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTelemetryInput {
  @Field()
  @IsUUID()
  carId!: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  timestamp!: Date;

  @Field(() => Float)
  @IsNumber()
  @Min(250, { message: 'Battery voltage below 250V is rejected as invalid sensor data' })
  @Max(500)
  batteryVoltage!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryPercentage!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-40, { message: 'Battery temp below -40C is invalid' })
  @Max(80, { message: 'Battery temp above 80C is invalid' })
  batteryTempCelsius!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-40, { message: 'Motor temp below -40C is invalid' })
  @Max(200, { message: 'Motor temp above 200C is invalid' })
  motorTempCelsius!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(15000, { message: 'RPM above 15000 is invalid' })
  rpm!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-50, { message: 'Cabin temp below -50C is invalid' })
  @Max(60, { message: 'Cabin temp above 60C is invalid' })
  cabinTempCelsius!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  currentMileage!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(300, { message: 'Speed above 300 km/h is invalid' })
  speedKmh!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsOptional()
  faultCodes?: string[];

  @Field()
  @IsBoolean()
  isCharging!: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500, { message: 'Charging power above 500kW is invalid' })
  chargingPowerKw?: number;
}
