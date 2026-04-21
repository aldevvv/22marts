import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    return { items, total, count: items.length };
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Stok tidak mencukupi');
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        throw new BadRequestException('Jumlah melebihi stok tersedia');
      }

      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: { include: { category: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: { include: { category: true } } },
    });
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Item tidak ditemukan');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { deleted: true };
    }

    if (quantity > item.product.stock) {
      throw new BadRequestException('Jumlah melebihi stok tersedia');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { include: { category: true } } },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Item tidak ditemukan');
    }

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }

  async getCount(userId: string) {
    const count = await this.prisma.cartItem.count({ where: { userId } });
    return { count };
  }
}
