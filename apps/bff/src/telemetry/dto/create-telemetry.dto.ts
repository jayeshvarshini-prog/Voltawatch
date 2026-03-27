import {
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateTelemetryDto {
  @IsUUID()
  carId!: string;

  @IsDateString()
  timestamp!: string;

  @IsNumber()
  @Min(250)
  @Max(500)
  batteryVoltage!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  batteryPercentage!: number;

  @IsNumber()
  @Min(-40)
  @Max(80)
  batteryTempCelsius!: number;

  @IsNumber()
  @Min(-40)
  @Max(200)
  motorTempCelsius!: number;

  @IsNumber()
  @Min(0)
  @Max(15000)
  rpm!: number;

  @IsNumber()
  @Min(-50)
  @Max(60)
  cabinTempCelsius!: number;

  @IsNumber()
  @Min(0)
  currentMileage!: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  speedKmh!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsArray()
  @IsOptional()
  faultCodes?: string[];

  @IsBoolean()
  isCharging!: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  chargingPowerKw?: number;
}

export class BatchTelemetryDto {
  readings!: CreateTelemetryDto[];
}
