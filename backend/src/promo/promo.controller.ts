import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PromoService } from './promo.service';

@Controller('promos')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Get()
  findAll() {
    return this.promoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promoService.findOne(id);
  }

  @Post()
  create(@Body() body: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) {
    return this.promoService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: {
    code?: string;
    description?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    return this.promoService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promoService.remove(id);
  }

  @Post('validate')
  validate(@Body() body: { code: string; subtotal: number; userId?: string }) {
    return this.promoService.validate(body.code, body.subtotal, body.userId);
  }
}
