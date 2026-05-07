import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from '../common/entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
