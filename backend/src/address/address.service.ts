import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    return address;
  }

  async create(
    userId: string,
    data: {
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
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If first address, set as default
    const count = await this.prisma.address.count({ where: { userId } });
    if (count === 0) {
      data.isDefault = true;
    }

    return this.prisma.address.create({
      data: { ...data, userId },
    });
  }

  async update(
    userId: string,
    id: string,
    data: {
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
    await this.findOne(userId, id);

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const address = await this.findOne(userId, id);

    await this.prisma.address.delete({ where: { id } });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { deleted: true };
  }

  async setDefault(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
