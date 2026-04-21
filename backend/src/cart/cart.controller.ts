import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Query('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Get('count')
  getCount(@Query('userId') userId: string) {
    return this.cartService.getCount(userId);
  }

  @Post()
  addItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity?: number,
  ) {
    return this.cartService.addItem(userId, productId, quantity || 1);
  }

  @Patch(':id')
  updateQuantity(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(userId, id, quantity);
  }

  @Delete(':id')
  removeItem(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  clearCart(@Query('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
