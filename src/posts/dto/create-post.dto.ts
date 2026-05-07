// PickType: 기존 클래스에서 일부 필드만 골라 새 클래스를 만들어주는 헬퍼
// → 엔티티에 정의한 검증 규칙(@IsString 등)을 그대로 재사용 → DRY
import { PickType } from '@nestjs/mapped-types';
// class-validator: 추가로 필요한 검증 데코레이터
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../../common/entity/posts.entity';

// PostsModel에서 'title', 'content'만 골라 그대로 상속
// → title, content의 @IsString() 검증이 자동으로 적용됨
// 추가로 필요한 필드(images)는 클래스 본문에 직접 선언
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  // 이미지 파일명 배열 (예: ["a.jpg", "b.jpg"])
  // 파일 업로드는 시간이 오래 걸리기 때문에, 게시글 생성과 함께 보내면 사용자가 오래 기다려야 함
  // → 이미지를 먼저 업로드(POST /posts/image)해서 파일명을 받고, 그 파일명들만 여기에 담아 게시글 생성 요청
  @IsOptional() // 값이 없으면(undefined/null) 다른 검증을 건너뜀
  @IsArray() // 배열인지 검증
  @IsString({ each: true }) // 배열 각 원소가 문자열인지 검증
  images?: string[];
}
