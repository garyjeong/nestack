import { HttpException } from '@nestjs/common';
import { ErrorCodes, ErrorCodeKey } from '../constants/error-codes.constant';

export class BusinessException extends HttpException {
  public readonly errorCode: string;

  constructor(
    errorCodeKey: ErrorCodeKey,
    details?: Record<string, unknown>,
  ) {
    const error = ErrorCodes[errorCodeKey];
    super(
      {
        code: error.code,
        message: error.message,
        details,
      },
      error.status,
    );
    this.errorCode = error.code;
  }
}
