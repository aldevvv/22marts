import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.addressService.findAll(userId);
  }

  @Get(':id')
  findOne(@Query('userId') userId: string, @Param('id') id: string) {
    return this.addressService.findOne(userId, id);
  }

  @Post()
  create(
    @Body()
    body: {
      userId: string;
      label: string;
      name: string;
      phone: string;
      address: string;
      province: string;
      provinceId: string;
      city: string;
      cityId: string;
      district: string;
      districtId: string;
      village: string;
      villageId: string;
      postalCode: string;
      notes?: string;
      isDefault?: boolean;
    },
  ) {
    const { userId, ...data } = body;
    return this.addressService.create(userId, data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      userId: string;
      label?: string;
      name?: string;
      phone?: string;
      address?: string;
      province?: string;
      provinceId?: string;
      city?: string;
      cityId?: string;
      district?: string;
      districtId?: string;
      village?: string;
      villageId?: string;
      postalCode?: string;
      notes?: string;
      isDefault?: boolean;
    },
  ) {
    const { userId, ...data } = body;
    return this.addressService.update(userId, id, data);
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id') id: string) {
    return this.addressService.remove(userId, id);
  }

  @Patch(':id/default')
  setDefault(@Query('userId') userId: string, @Param('id') id: string) {
    return this.addressService.setDefault(userId, id);
  }
}
