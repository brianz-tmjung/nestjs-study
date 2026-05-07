import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 모든 엔티티의 공통 필드를 정의하는 추상 클래스
// id, createdAt, updatedAt을 자동으로 관리
export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
