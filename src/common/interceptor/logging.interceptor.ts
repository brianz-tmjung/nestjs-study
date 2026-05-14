import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * 요청이 들어올때 들어온 타임스탬프를찍는다
   * req {path} {시간}
   * 요청이 끝날때 다시 타임스탬프
   * res {path} {응답시간} {걸린시간}
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: unknown; message: string }> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.originalUrl;
    const method = req.method;
    // next.handle()을 실행하는 순간
    // 라우터의 로직이 실행되고 응답이 반환된다

    // pipe: Observable에 연산자를 순서대로 적용하는 메서드
    return next.handle().pipe(
      // tap: 값을 그대로 흘려보내며 부수효과(로깅 등)만 실행
      tap(() =>
        console.log(`[RES] ${method} ${path} ... ${Date.now() - now} ms`),
      ),
      // map: 응답 데이터를 새 형태로 변환
      // 단축 객체 속성 문법: ({ data }) === ({ data: data })
      map((data: unknown) => ({ data, message: 'success' })),
    );
  }
}
