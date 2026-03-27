import { IsString, IsInt, IsOptional, IsNumber, Min, Max, Length } from 'class-validator';

export class CreateCarDto {
  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(1990)
  @Max(2030)
  year!: number;

  @IsInt()
  @Min(0)
  currentMileage!: number;

  @IsNumber()
  @IsOptional()
  batteryHealthPercentage?: number;

  @IsInt()
  @Min(0)
  estimatedRangeKm!: number;
}

export class UpdateCarDto {
  @IsString()
  @Length(17, 17)
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1990)
  @Max(2030)
  @IsOptional()
  year?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  currentMileage?: number;

  @IsNumber()
  @IsOptional()
  batteryHealthPercentage?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedRangeKm?: number;

  @IsOptional()
  lastServiceDate?: string;
}
