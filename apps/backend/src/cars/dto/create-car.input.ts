import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional, Min, Max, Length, IsUUID, IsNumber } from 'class-validator';

@InputType()
export class CreateCarInput {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @Field()
  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin!: string;

  @Field()
  @IsString()
  model!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1990)
  @Max(2030)
  year!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  currentMileage!: number;

  @Field(() => Float, { defaultValue: 100 })
  @IsNumber()
  @IsOptional()
  batteryHealthPercentage?: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  estimatedRangeKm!: number;
}
