import { DomainError } from './domainError.js';

class UserNotFoundError extends DomainError {
  constructor(user_id) {
    super(`User ${user_id} not found`, 404);
    this.user_id = user_id;
  }
}

class UserCreationError extends DomainError {
  constructor(message = 'Failed to create user') {
    super(message, 500);
  }
}

class UserUpdateError extends DomainError {
  constructor(user_id, message = 'Failed to update user') {
    super(`${message}: ${user_id}`, 500);
    this.user_id = user_id;
  }
}

class UserDeletionError extends DomainError {
  constructor(user_id, message = 'Failed to delete user') {
    super(`${message}: ${user_id}`, 500);
    this.user_id = user_id;
  }
}

class UserValidationError extends DomainError {
  constructor(message, details = {}) {
    super(message, 400);
    this.details = details;
  }
}

class UserEmailAlreadyExistsError extends DomainError {
  constructor(email) {
    super(`Email ${email} is already registered`, 409);
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
