import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { Observable, catchError, tap } from 'rxjs';
import { DataSource } from 'typeorm';

/**
 * 트랜잭션 인터셉터
 * - 컨트롤러 메서드 실행 전: queryRunner 생성 → connect → startTransaction
 * - 메서드 실행 성공 시: commit
 * - 메서드 실행 실패 시: rollback
 * - 마지막에 release
 *
 * 컨트롤러/서비스에서는 req.queryRunner로 접근해 같은 트랜잭션에 묶을 수 있다.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<
      Request & { queryRunner?: import('typeorm').QueryRunner }
    >();

    // 1) 트랜잭션과 관련된 모드 쿼리를 담당함

    const qr = this.dataSource.createQueryRunner();
    //쿼리 러너 연결
    await qr.connect();
    await qr.startTransaction();

    // 2) request에 qr 부착 → 컨트롤러/서비스에서 꺼내 쓰도록
    req.queryRunner = qr;

    return next.handle().pipe(

      // 실패 시 rollback + release 후 에러 재던지기
      catchError(async (err) => {
        await qr.rollbackTransaction();
        await qr.release();
        throw new InternalServerErrorException(
          err instanceof Error ? err.message : 'Transaction failed',
        );
      }),
      // 성공 시 commit + release
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
