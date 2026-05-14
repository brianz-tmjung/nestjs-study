import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * 모든 요청이 들어올 때 가장 먼저 실행되는 로그 미들웨어.
 * 컨트롤러보다 먼저 동작하므로 라우트 진입 전 로깅에 유용.
 */
@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    next();
  }
}
