import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string' ? response : (response as any).message || exception.message;

      return new GraphQLError(Array.isArray(message) ? message.join('; ') : message, {
        extensions: {
          code: this.mapStatusToCode(exception.getStatus()),
          statusCode: exception.getStatus(),
        },
      });
    }

    if (exception instanceof Error) {
      return new GraphQLError(exception.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }

    return new GraphQLError('An unexpected error occurred', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }

  private mapStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
    };
    return map[status] || 'INTERNAL_SERVER_ERROR';
  }
}
