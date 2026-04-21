import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get user() {
    return this.prisma.user;
  }

  get category() {
    return this.prisma.category;
  }

  get product() {
    return this.prisma.product;
  }

  get cartItem() {
    return this.prisma.cartItem;
  }

  get address() {
    return this.prisma.address;
  }

  get order() {
    return this.prisma.order;
  }

  get orderItem() {
    return this.prisma.orderItem;
  }

  get favorite() {
    return this.prisma.favorite;
  }

  get promo() {
    return this.prisma.promo;
  }

  get promoUsage() {
    return this.prisma.promoUsage;
  }
}
