import { DomainError } from '../domain/domainError.js';

class ForeignKeyViolationError extends DomainError {
  constructor(message, entityId) {
    super(message, 409);
    this.entityId = entityId;
  }
}

class UserHasReferencesError extends ForeignKeyViolationError {
  constructor(user_id) {
    super(
      `Cannot delete user ${user_id}: user has related records (posts, etc.)`,
      user_id
    );
    this.user_id = user_id;
  }
}

class PostHasReferencesError extends ForeignKeyViolationError {
  constructor(post_id) {
    super(`Cannot delete post ${post_id}: post has related records`, post_id);
    this.post_id = post_id;
  }
}

class InvalidReferenceError extends DomainError {
  constructor(message, referenceId) {
    super(message, 400);
    this.referenceId = referenceId;
  }
}

export {
  ForeignKeyViolationError,
  UserHasReferencesError,
  PostHasReferencesError,
  InvalidReferenceError,
};
