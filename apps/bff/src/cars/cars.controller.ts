import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCarDto, UpdateCarDto } from './dto/create-car.dto';

@Controller('api/cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  async getAllCars() {
    return this.carsService.getAllCars();
  }

  @Get(':id')
  async getCar(@Param('id') id: string) {
    return this.carsService.getCar(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCar(@Body() body: CreateCarDto, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.carsService.createCar(body, token);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCar(@Param('id') id: string, @Body() body: UpdateCarDto, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.carsService.updateCar(id, body, token);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCar(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.carsService.deleteCar(id, token);
  }
}
