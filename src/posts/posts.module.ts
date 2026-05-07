import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsModel } from '../common/entity/posts.entity';
import { PostImage } from '../common/entity/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, PostImage]),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
      },
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
