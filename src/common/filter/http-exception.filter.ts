import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP 예외(HttpException 및 그 서브클래스)를 잡아서
 * LoggingInterceptor와 일관된 형태로 응답을 만들어주는 필터.
 *
 * 예시 응답:
 * {
 *   "data": null,
 *   "message": "Not Found",
 *   "statusCode": 404,
 *   "path": "/posts/9999",
 *   "timestamp": "2026-05-08T16:30:00Z"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // HTTP 컨텍스트로 좁히기
    const ctx = host.switchToHttp();
    //응답이 나갈때 가져오는거기때문에 response,request를 가져올수있따.
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 예외에서 상태 코드와 메시지 추출
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // exception.getResponse()는 string이나 객체를 반환할 수 있음
    // 객체일 경우 보통 { message, error, statusCode } 형태
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string | string[] }).message ??
          exception.message);

    // 3) 통일된 응답 형태로 반환
    response
      .status(status)
      .json({
        data: null,
        message,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toLocaleString(),
      });
  }
}
