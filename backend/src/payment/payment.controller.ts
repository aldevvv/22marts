import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  createTransaction(
    @Body()
    body: {
      userId: string;
      addressId: string;
      notes?: string;
      idempotencyKey: string;
      promoCode?: string;
    },
  ) {
    return this.paymentService.createTransaction(body);
  }

  @Get('status/:orderId')
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.updateOrderPayment(orderId);
  }

  @Get('orders')
  getOrders(@Query('userId') userId: string) {
    if (userId) return this.paymentService.getOrders(userId);
    return this.paymentService.getAllOrders();
  }

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getOrderByOrderId(orderId);
  }

  @Patch('orders/:orderId/status')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: 'DIPROSES' | 'DIKIRIM' | 'SELESAI',
  ) {
    return this.paymentService.updateOrderStatus(orderId, status);
  }
}
