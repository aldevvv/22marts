import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo tidak ditemukan');
    return promo;
  }

  async create(data: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.promo.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) throw new BadRequestException('Kode promo sudah digunakan');

    return this.prisma.promo.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async update(id: string, data: {
    code?: string;
    description?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    await this.findOne(id);

    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return this.prisma.promo.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.promo.delete({ where: { id } });
  }

  async validate(code: string, subtotal: number, userId?: string) {
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      throw new BadRequestException('Kode promo tidak valid');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Promo sudah tidak aktif');
    }

    const now = new Date();
    if (now < promo.startDate) {
      throw new BadRequestException('Promo belum dimulai');
    }
    if (now > promo.endDate) {
      throw new BadRequestException('Promo sudah berakhir');
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Kuota promo sudah habis');
    }

    // Check per-user limit
    if (promo.perUserLimit > 0 && userId) {
      const userUsage = await this.prisma.promoUsage.findUnique({
        where: { userId_promoId: { userId, promoId: promo.id } },
      });
      if (userUsage) {
        throw new BadRequestException('Anda sudah pernah menggunakan promo ini');
      }
    }

    if (subtotal < promo.minPurchase) {
      throw new BadRequestException(
        `Minimum pembelian Rp ${promo.minPurchase.toLocaleString('id-ID')}`,
      );
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = Math.floor(subtotal * promo.discountValue / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    if (discount > subtotal) discount = subtotal;

    return {
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minPurchase: promo.minPurchase,
        maxDiscount: promo.maxDiscount,
      },
      discount,
      total: subtotal - discount,
    };
  }

  async incrementUsage(code: string, userId?: string) {
    const promo = await this.prisma.promo.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });

    // Record per-user usage
    if (userId) {
      await this.prisma.promoUsage.upsert({
        where: { userId_promoId: { userId, promoId: promo.id } },
        create: { userId, promoId: promo.id },
        update: {},
      });
    }

    return promo;
  }
}
