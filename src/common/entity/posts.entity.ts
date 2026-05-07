// TypeORM: 엔티티/관계 정의용 데코레이터
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
// class-validator: 런타임 검증
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PostImage } from './image.entity';
import { UsersModel } from './users.entity';
import { BaseModel } from './base.entity';

@Entity()
export class PostsModel extends BaseModel {
  // 1) 작성자 — UsersModel과 N:1 관계 (게시글 N개 ← 사용자 1명)
  // nullable: false → 작성자 없는 게시글 불가
  // @JoinColumn: 외래키 컬럼명을 'authorId'로 명시 (DB에 author_id가 아닌 authorId로 생성)
  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  @JoinColumn({ name: 'authorId' })
  author!: UsersModel;

  // 외래키 컬럼 (author 관계의 실제 DB 컬럼)
  // 클라이언트가 직접 ID로 작성자를 지정할 때도 사용
  @Column()
  @IsInt()
  authorId!: number;

  // 게시글 제목
  @Column()
  @IsString()
  title!: string;

  // 게시글 본문
  @Column()
  @IsString()
  content!: string;

  // 좋아요 수 — 입력 시 생략 가능, DB 기본값 0
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  likeCount!: number;

  // 댓글 수 — 입력 시 생략 가능, DB 기본값 0
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  commentCount!: number;

  // 게시글에 첨부된 이미지들 (1:N)
  // cascade: true → 게시글 저장 시 images 배열의 PostImage들도 함께 INSERT
  // (별도로 PostImage를 save() 할 필요 없음)
  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images?: PostImage[];
}
