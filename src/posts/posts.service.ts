import { Injectable, NotFoundException } from '@nestjs/common';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'mj',
    title: '뉴진스',
    content: '메이크업',
    likeCount: 1000,
    commentCount: 4,
  },
  {
    id: 2,
    author: 'mj2',
    title: '뉴진스2',
    content: '메이크업3',
    likeCount: 10040,
    commentCount: 42,
  },
];

@Injectable()
export class PostsService {
  // 1) GET /posts
  getAllPosts(): PostModel[] {
    return posts;
  }

  // 2) GET /posts/:id
  getPostById(id: number): PostModel {
    const post = posts.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  // 3) POST /posts
  createPost(author: string, title: string, content: string): PostModel {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];
    return post;
  }

  // 4) PUT /posts/:id
  updatePost(
    id: number,
    author?: string,
    title?: string,
    content?: string,
  ): PostModel {
    const post = posts.find((post) => post.id === id);
    if (post) {
      if (author) post.author = author;
      if (title) post.title = title;
      if (content) post.content = content;
      return post;
    }
    const newPost: PostModel = {
      id,
      author: author ?? '',
      title: title ?? '',
      content: content ?? '',
      likeCount: 0,
      commentCount: 0,
    };
    posts.push(newPost);
    return newPost;
  }

  // 5) DELETE /posts/:id
  deletePost(id: number): { id: number } {
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new NotFoundException();
    }
    posts.splice(index, 1);
    return { id };
  }
}
