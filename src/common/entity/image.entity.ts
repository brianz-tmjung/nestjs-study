// TypeORM: 엔티티/관계 정의용 데코레이터
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
// class-validator: 런타임 검증 (PascalCase가 데코레이터, lowercase는 유틸 함수 — 데코레이터로 쓰면 안 됨)
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
// class-transformer: 직렬화/역직렬화 시 값을 변형
import { Transform } from 'class-transformer';
// path.join: OS에 맞는 경로 구분자로 경로 결합
import { join } from 'path';
import { PostsModel } from './posts.entity';
import { BaseModel } from './base.entity';

// 정적 파일 경로 상수 (게시글 이미지가 저장된 URL prefix)
const POST_IMG_PATH = '/uploads/posts';

// 이미지가 어디에 사용되는 이미지인지 구분 (추후 USER_AVATAR 등 추가 가능)
export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class PostImage extends BaseModel {
  // 게시글 내 이미지 순서 (0부터 시작) — 입력 시 생략 가능, DB 기본값 0
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  order!: number;

  // 이미지의 종류 (POST_IMAGE 등) — DB에는 enum 컬럼으로 저장
  @Column({ enum: ImageModelType })
  @IsEnum(ImageModelType)
  type!: ImageModelType;

  // 이미지 파일명 (예: "abc.jpg")
  // 응답으로 직렬화될 때 type에 따라 전체 URL 경로로 변환
  // 예: "abc.jpg" → "/uploads/posts/abc.jpg"
  @Column()
  @IsString()
  @Transform(({ value, obj }: { value: string; obj: PostImage }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return join(POST_IMG_PATH, value);
    }
    return value;
  })
  path!: string;

  // 어떤 게시글에 속하는지 (N:1) — onDelete CASCADE: 게시글 삭제 시 이미지도 함께 삭제
  // nullable: 업로드 시점에는 아직 게시글이 없을 수 있음 (선업로드 패턴)
  @ManyToOne(() => PostsModel, (post) => post.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'postId' })
  post?: PostsModel;

  // 외래키 컬럼 (post 관계의 실제 DB 컬럼)
  @Column({ nullable: true })
  postId?: number;
}
