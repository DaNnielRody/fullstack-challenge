import { DomainError } from './domainError.js';
import { ERROR_CODES } from '../codes.js';

class PostNotFoundError extends DomainError {
  constructor(post_id) {
    super('Post not found', 404, ERROR_CODES.POST_NOT_FOUND);
    this.post_id = post_id;
  }
}

class AuthorNotFoundError extends DomainError {
  constructor(author_id) {
    super('Author not found', 404, ERROR_CODES.AUTHOR_NOT_FOUND);
    this.author_id = author_id;
  }
}

class PostCreationError extends DomainError {
  constructor(message = 'Failed to create post') {
    super(message, 500, ERROR_CODES.POST_CREATION_ERROR);
  }
}

class PostUpdateError extends DomainError {
  constructor(post_id, message = 'Failed to update post') {
    super(message, 500, ERROR_CODES.POST_UPDATE_ERROR);
    this.post_id = post_id;
  }
}

class PostDeletionError extends DomainError {
  constructor(post_id, message = 'Failed to delete post') {
    super(message, 500, ERROR_CODES.POST_DELETION_ERROR);
    this.post_id = post_id;
  }
}

class PostValidationError extends DomainError {
  constructor(message, details = {}) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

export {
  PostNotFoundError,
  AuthorNotFoundError,
  PostCreationError,
  PostUpdateError,
  PostDeletionError,
  PostValidationError,
};
