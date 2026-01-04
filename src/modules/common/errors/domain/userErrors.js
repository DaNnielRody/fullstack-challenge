import { DomainError } from './domainError.js';
import { ERROR_CODES } from '../codes.js';

class UserNotFoundError extends DomainError {
  constructor(user_id) {
    super('User not found', 404, ERROR_CODES.USER_NOT_FOUND);
    this.user_id = user_id;
  }
}

class UserCreationError extends DomainError {
  constructor(message = 'Failed to create user') {
    super(message, 500, ERROR_CODES.USER_CREATION_ERROR);
  }
}

class UserUpdateError extends DomainError {
  constructor(user_id, message = 'Failed to update user') {
    super(message, 500, ERROR_CODES.USER_UPDATE_ERROR);
    this.user_id = user_id;
  }
}

class UserDeletionError extends DomainError {
  constructor(user_id, message = 'Failed to delete user') {
    super(message, 500, ERROR_CODES.USER_DELETION_ERROR);
    this.user_id = user_id;
  }
}

class UserValidationError extends DomainError {
  constructor(message, details = {}) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

class UserEmailAlreadyExistsError extends DomainError {
  constructor(email) {
    super(
      'This email is already registered',
      409,
      ERROR_CODES.EMAIL_ALREADY_EXISTS
    );
    this.email = email;
  }
}

export {
  UserNotFoundError,
  UserCreationError,
  UserUpdateError,
  UserDeletionError,
  UserValidationError,
  UserEmailAlreadyExistsError,
};
