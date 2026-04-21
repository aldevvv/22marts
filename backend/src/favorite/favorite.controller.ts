import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.favoriteService.findAll(userId);
  }

  @Get('count')
  getCount(@Query('userId') userId: string) {
    return this.favoriteService.getCount(userId);
  }

  @Get('check/:productId')
  check(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoriteService.check(userId, productId);
  }

  @Post('toggle')
  toggle(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
  ) {
    return this.favoriteService.toggle(userId, productId);
  }

  @Delete(':productId')
  remove(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoriteService.remove(userId, productId);
  }
}
