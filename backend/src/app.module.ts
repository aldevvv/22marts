import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { AddressModule } from './address/address.module';
import { PaymentModule } from './payment/payment.module';
import { FavoriteModule } from './favorite/favorite.module';
import { PromoModule } from './promo/promo.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    UserModule,
    CartModule,
    AddressModule,
    PaymentModule,
    FavoriteModule,
    PromoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
