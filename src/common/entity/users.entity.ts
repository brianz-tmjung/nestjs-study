import { Column, Entity, OneToMany } from 'typeorm';
import { PostsModel } from './posts.entity';
import { BaseModel } from './base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({ unique: true })
  nickname!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // 사용자가 작성한 게시글들 (1:N)
  @OneToMany(() => PostsModel, (post) => post.author)
  posts?: PostsModel[];
}
