import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as Midtrans from 'midtrans-client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private snap: any;
  private midtranxSupabase: any;

  constructor(private prisma: PrismaService) {
    this.snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    this.midtranxSupabase = createClient(
      process.env.MIDTRANX_URL || '',
      process.env.MIDTRANX_SERVICE_KEY || '',
    );
  }

  async createTransaction(data: {
    userId: string;
    addressId: string;
    notes?: string;
    idempotencyKey: string;
    promoCode?: string;
  }) {
    // Idempotency check
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      include: { items: true },
    });

    if (existing) {
      return {
        order: existing,
        token: existing.snapToken,
        redirectUrl: null,
      };
    }

    // Get cart
    const cart = await this.prisma.cartItem.findMany({
      where: { userId: data.userId },
      include: { product: true },
    });

    if (cart.length === 0) {
      throw new BadRequestException('Keranjang kosong');
    }

    // Get address
    const address = await this.prisma.address.findFirst({
      where: { id: data.addressId, userId: data.userId },
    });

    if (!address) {
      throw new BadRequestException('Alamat tidak ditemukan');
    }

    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Apply promo if provided
    let discount = 0;
    if (data.promoCode) {
      const promo = await this.prisma.promo.findUnique({
        where: { code: data.promoCode.toUpperCase() },
      });

      if (promo && promo.isActive) {
        const now = new Date();
        if (now >= promo.startDate && now <= promo.endDate) {
          if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
            // Check per-user limit
            let userAlreadyUsed = false;
            if (promo.perUserLimit > 0) {
              const userUsage = await this.prisma.promoUsage.findUnique({
                where: { userId_promoId: { userId: data.userId, promoId: promo.id } },
              });
              if (userUsage) userAlreadyUsed = true;
            }

            if (!userAlreadyUsed && subtotal >= promo.minPurchase) {
              if (promo.discountType === 'PERCENTAGE') {
                discount = Math.floor(subtotal * promo.discountValue / 100);
                if (promo.maxDiscount && discount > promo.maxDiscount) {
                  discount = promo.maxDiscount;
                }
              } else {
                discount = promo.discountValue;
              }
              if (discount > subtotal) discount = subtotal;

              // Increment usage + record per-user
              await this.prisma.promo.update({
                where: { id: promo.id },
                data: { usedCount: { increment: 1 } },
              });
              await this.prisma.promoUsage.upsert({
                where: { userId_promoId: { userId: data.userId, promoId: promo.id } },
                create: { userId: data.userId, promoId: promo.id },
                update: {},
              });
            }
          }
        }
      }
    }

    const total = Math.max(subtotal - discount, 1); // Midtrans minimum 1

    // Generate order ID
    const orderId = `22MART${Date.now().toString().slice(-6)}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Get user
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    // Create Midtrans transaction
    const transactionPayload: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
      customer_details: {
        email: user?.email,
        first_name: user?.name,
        phone: address.phone,
        shipping_address: {
          first_name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          postal_code: address.postalCode,
        },
      },
    };

    // Only include item_details when no discount (Midtrans doesn't support negative prices)
    if (discount === 0) {
      transactionPayload.item_details = cart.map((item) => ({
        id: item.productId,
        name: item.product.name.substring(0, 50),
        price: item.product.price,
        quantity: item.quantity,
      }));
    }

    const transaction = await this.snap.createTransaction(transactionPayload);

    // Create order in DB
    const shippingAddress = `${address.address}, ${address.village}, ${address.district}, ${address.city}, ${address.province}, ${address.postalCode}`;

    const order = await this.prisma.order.create({
      data: {
        orderId,
        idempotencyKey: data.idempotencyKey,
        subtotal,
        discount,
        promoCode: discount > 0 ? (data.promoCode || null) : null,
        total,
        shippingName: address.name,
        shippingPhone: address.phone,
        shippingAddress,
        notes: data.notes,
        snapToken: transaction.token,
        userId: data.userId,
        items: {
          create: cart.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
            productId: item.productId,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId: data.userId } });

    return {
      order,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  async getPaymentStatus(orderId: string) {
    const { data, error } = await this.midtranxSupabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return { found: false, status: 'not_found' };
    }

    const isSuccess =
      data.status === 'settlement' ||
      (data.status === 'capture' && data.fraud_status === 'accept');

    return {
      found: true,
      status: data.status,
      isSuccess,
      amount: data.gross_amount,
      paymentType: data.payment_type,
      paidAt: data.processed_at,
    };
  }

  async updateOrderPayment(orderId: string) {
    const status = await this.getPaymentStatus(orderId);

    if (status.found && status.isSuccess) {
      await this.prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus: 'settlement',
          paymentType: status.paymentType,
        },
      });
    }

    return status;
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderByOrderId(orderId: string) {
    return this.prisma.order.findUnique({
      where: { orderId },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateOrderStatus(orderId: string, status: 'DIPROSES' | 'DIKIRIM' | 'SELESAI') {
    return this.prisma.order.update({
      where: { orderId },
      data: { status },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    });
  }
}
