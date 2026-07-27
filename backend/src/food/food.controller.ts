import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { FoodService } from './food.service.js';
import { FoodNotFoundError } from './food-not-found.error.js';
import { FoodNotFoundFilter } from './food-not-found.filter.js';
import type { CreateFoodData, Food, UpdateFoodData } from './food.types.js';

@Controller('foods')
@UseFilters(FoodNotFoundFilter)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Body() data: CreateFoodData,
  ): Promise<Food> {
    return this.foodService.create(userId, data);
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string): Promise<Food[]> {
    return this.foodService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<Food> {
    const food = await this.foodService.findOne(userId, id);
    if (!food) {
      throw new FoodNotFoundError(id);
    }
    return food;
  }

  @Patch(':id')
  update(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateFoodData,
  ): Promise<Food> {
    return this.foodService.update(userId, id, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.foodService.remove(userId, id);
  }
}
