import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import {
  DisapproveShop,
  ShopsController,
  StaffsController,
  TopShopsController,
} from './shops.controller';

@Module({
  controllers: [
    ShopsController,
    StaffsController,
    TopShopsController,
    DisapproveShop,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}
