import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { basename } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ImageModelType } from '../common/entity/image.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) { }

  // 1) GET /posts
  // 모든 post를 다 가져온다
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // id에 해당하는 post를 가져온다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  // 새로운 post를 생성한다
  @Post()
  async postPost(
    @Body('authorId', ParseIntPipe) authorId: number,
    @Body() body: CreatePostDto,
  ) {
    // 1) 비-DB 작업: 파일명 정제 (../ 같은 path traversal 시도 차단)
    const images: string[] = body.images?.map((name) => basename(name)) ?? [];

    // 2) 트랜잭션 시작
    const qr = this.dataSource.createQueryRunner();
    //쿼리 러너를 연결한다
    //이시점 부턴 트랜잭션 안에서 데이터베이스 액션을 시작할수잇다
    await qr.connect();
    //시작
    await qr.startTransaction();

    try {
      // 2-1) 게시글 생성
      const post = await this.postsService.createPost(authorId, body, qr);

      // 2-2) 이미지마다 createPostImage 호출 (post 연결, order 부여)
      for (let i = 0; i < images.length; i++) {
        await this.postsService.createPostImage(
          {
            post,
            order: i,
            path: images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      await qr.commitTransaction(); // 모든 작업 성공 시 커밋
      return this.postsService.getPostById(post.id);
    } catch (err) {
      await qr.rollbackTransaction(); // 실패 시 전체 취소
      throw err;
    } finally {
      await qr.release(); // 커넥션 반환
    }
  }

  // 3-1) POST /posts/image
  // 이미지 파일을 업로드한다 (게시글 생성 전 선업로드)
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  createPostImage(@UploadedFile() file: Express.Multer.File) {
    return this.postsService.createPostImage({
      path: file.filename,
      type: ImageModelType.POST_IMAGE,
      order: 0,
    });
  }

  // 4) PUT /posts/:id
  // id에 해당하는 post를 변경하거나 생성한다
  @Put(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, author, title, content);
  }

  // 5) DELETE /posts/:id
  // id에 해당하는 post를 삭제한다
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
