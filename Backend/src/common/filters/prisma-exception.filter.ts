import { ArgumentsHost, Catch, ConflictException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        response.status(status).json({
          statusCode: status,
          message: `Unique constraint failed on the ${target}. This ${target} is already in use.`,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: exception.meta?.cause || 'Record not found.',
          error: 'Not Found',
        });
        break;
      }
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: `Foreign key constraint failed on the field: ${exception.meta?.field_name || 'relation'}.`,
          error: 'Bad Request',
        });
        break;
      }
      default:
        // default 500 error for unhandled codes
        super.catch(exception, host);
        break;
    }
  }
}
