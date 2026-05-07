import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../../common/entity/posts.entity';

// 게시글 조회 시 기본 옵션
// - relations: author와 images를 함께 로드 (lazy load 방지, N+1 문제 회피)
// - order: 이미지를 order 컬럼 기준 오름차순 정렬
export const DEFAULT_POSTS_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  relations: {
    author: true,
    images: true,
  },

};
