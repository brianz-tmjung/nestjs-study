import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

/**
 * Custom Param Decorator
 * TransactionInterceptor가 req.queryRunner에 심어둔 값을
 * 컨트롤러 파라미터로 꺼내 쓰기 위한 데코레이터.
 */
export const QueryRunner = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  if (!req.queryRunner) {
    throw new InternalServerErrorException(
      'QueryRunner not found in request. Make sure to use TransactionInterceptor.',
    );
  }
  return req.queryRunner;
});
