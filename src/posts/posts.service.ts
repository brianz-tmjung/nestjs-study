import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { PostsModel } from '../common/entity/posts.entity';
import { PostImage } from '../common/entity/image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostImageDto } from './dto/create-post-image.dto';
import { DEFAULT_POSTS_FIND_OPTIONS } from './const/default-posts-find-options.const';

const TEMP_forder_path = join(process.cwd(), 'uploads', 'temp');
const POSTS_forder_path = join(process.cwd(), 'uploads', 'posts');

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
  ) { }

  // queryRunner가 있으면 트랜잭션에 묶인 repository를, 없으면 일반 repository를 반환
  // → 모든 메서드에서 분기 로직 중복 제거
  private getRepository(qr?: QueryRunner): Repository<PostsModel> {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }

  private getPostImageRepository(qr?: QueryRunner): Repository<PostImage> {
    return qr
      ? qr.manager.getRepository<PostImage>(PostImage)
      : this.postImageRepository;
  }

  // 1) GET /posts
  async getAllPosts() {
    return this.postsRepository.find(DEFAULT_POSTS_FIND_OPTIONS);
  }

  // 2) GET /posts/:id
  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POSTS_FIND_OPTIONS,
      where: { id },
    });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  // 3) POST /posts
  // 게시글만 생성 (이미지는 createPostImage에서 별도 처리하므로 dto.images는 무시)
  async createPost(authorId: number, dto: CreatePostDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const post = repository.create({
      title: dto.title,
      content: dto.content,
      authorId,
      likeCount: 0,
      commentCount: 0,
    });
    return repository.save(post);
  }

  // 3-1) POST /posts/image
  // 원칙: DB 작업(rollback 가능) → 파일 이동(rollback 불가) 순서
  // → DB에서 에러가 나면 파일이 아직 옮겨지지 않았으므로 깨끗한 상태 유지
  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const fileName = basename(dto.path); //path travesal 시도 차단용
    const tempPath = join(TEMP_forder_path, fileName);
    const finalPath = join(POSTS_forder_path, fileName);

    // 1) 비-DB 검증: temp 파일 존재 확인 (read only, 안전)
    try {
      await promises.access(tempPath);
    } catch {
      throw new BadRequestException('이미지 없');
    }

    // 2) DB 작업 먼저 (실패 시 throw → 파일 이동 안 됨)
    const repository = this.getPostImageRepository(qr);

    const result = await repository.save(
      repository.create({
        ...dto,
        path: fileName,
      }),
    );

    // 3) 파일 이동 (DB 저장 성공 후의 마지막 단계 — irreversible)
    await promises.mkdir(POSTS_forder_path, { recursive: true });
    await promises.rename(tempPath, finalPath);

    return result;
  }

  // 4) PUT /posts/:id
  async updatePost(
    id: number,
    author?: string,
    title?: string,
    content?: string,
  ) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POSTS_FIND_OPTIONS,
      where: { id },
    });
    if (!post) {
      throw new NotFoundException();
    }
    const updatedPost = this.postsRepository.create({
      ...post,
      ...(author && { author }),
      ...(title && { title }),
      ...(content && { content }),
    });
    const newPost = this.postsRepository.save(updatedPost);
    return newPost;
  }

  // 5) DELETE /posts/:id
  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException();
    }
    await this.postsRepository.remove(post);
    return { id };
  }
}
