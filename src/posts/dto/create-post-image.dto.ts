// PickType: 기존 클래스에서 일부 필드만 골라 새 클래스를 만들어주는 헬퍼
// → 엔티티에 정의한 검증 규칙을 그대로 재사용 → DRY
import { PickType } from '@nestjs/mapped-types';
import { PostImage } from '../../common/entity/image.entity';

// PostImage 엔티티에서 'path', 'order', 'type', 'post'만 골라 그대로 상속
// → 각 필드의 검증 규칙(@IsString, @IsInt, @IsOptional, @IsEnum)이 자동으로 적용됨
// post는 ManyToOne 관계 — 이미지가 어떤 게시글에 속하는지 지정 (선업로드 시엔 생략 가능)
export class CreatePostImageDto extends PickType(PostImage, [
  'path',
  'order',
  'type',
  'post',
]) {}
