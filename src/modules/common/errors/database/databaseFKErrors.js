import { DomainError } from '../domain/domainError.js';
import { ERROR_CODES } from '../codes.js';

class ForeignKeyViolationError extends DomainError {
  constructor(message, entityId, code) {
    super(message, 409, code);
    this.entityId = entityId;
  }
}

class UserHasReferencesError extends ForeignKeyViolationError {
  constructor(user_id) {
    super(
      'Cannot delete user: user has related records',
      user_id,
      ERROR_CODES.USER_HAS_REFERENCES
    );
    this.user_id = user_id;
  }
}

class PostHasReferencesError extends ForeignKeyViolationError {
  constructor(post_id) {
    super(
      'Cannot delete post: post has related records',
      post_id,
      ERROR_CODES.POST_HAS_REFERENCES
    );
    this.post_id = post_id;
  }
}

class InvalidReferenceError extends DomainError {
  constructor(message, referenceId) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    this.referenceId = referenceId;
  }
}

export {
  ForeignKeyViolationError,
  UserHasReferencesError,
  PostHasReferencesError,
  InvalidReferenceError,
};
