import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Controller('api/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get(':carId')
  async getTelemetry(
    @Param('carId') carId: string,
    @Query('limit') limit?: number,
  ) {
    return this.telemetryService.getTelemetry(carId, limit ? parseInt(String(limit), 10) : 100);
  }

  @Get(':carId/latest')
  async getLatestReading(@Param('carId') carId: string) {
    return this.telemetryService.getLatestReading(carId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async upsertReading(@Body() body: CreateTelemetryDto, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.telemetryService.upsertReading(body, token);
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  async batchUpsertReadings(@Body() body: { readings: CreateTelemetryDto[] }, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.telemetryService.batchUpsertReadings(body.readings, token);
  }
}
