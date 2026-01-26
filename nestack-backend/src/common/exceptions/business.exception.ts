import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// Predefined business exceptions
export class UserNotFoundException extends BusinessException {
  constructor() {
    super('User not found', HttpStatus.NOT_FOUND);
  }
}

export class UserAlreadyExistsException extends BusinessException {
  constructor() {
    super('User with this email already exists', HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends BusinessException {
  constructor() {
    super('Invalid or expired token', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailNotVerifiedException extends BusinessException {
  constructor() {
    super('Email is not verified', HttpStatus.FORBIDDEN);
  }
}

export class FamilyGroupNotFoundException extends BusinessException {
  constructor() {
    super('Family group not found', HttpStatus.NOT_FOUND);
  }
}

export class AlreadyInFamilyGroupException extends BusinessException {
  constructor() {
    super('User is already in a family group', HttpStatus.CONFLICT);
  }
}

export class InvalidInviteCodeException extends BusinessException {
  constructor() {
    super('Invalid or expired invite code', HttpStatus.BAD_REQUEST);
  }
}

export class MissionNotFoundException extends BusinessException {
  constructor() {
    super('Mission not found', HttpStatus.NOT_FOUND);
  }
}

export class BankAccountNotFoundException extends BusinessException {
  constructor() {
    super('Bank account not found', HttpStatus.NOT_FOUND);
  }
}

export class BadgeNotFoundException extends BusinessException {
  constructor() {
    super('Badge not found', HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedAccessException extends BusinessException {
  constructor() {
    super('Unauthorized access', HttpStatus.FORBIDDEN);
  }
}

export class OpenBankingTokenNotFoundException extends BusinessException {
  constructor() {
    super('Open Banking not connected', HttpStatus.NOT_FOUND);
  }
}
