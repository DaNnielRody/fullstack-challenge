import { DomainError } from './domainError.js';

class PostNotFoundError extends DomainError {
  constructor(post_id) {
    super(`Post ${post_id} not found`, 404);
    this.post_id = post_id;
  }
}

class AuthorNotFoundError extends DomainError {
  constructor(author_id) {
    super(`Author ${author_id} not found`, 404);
    this.author_id = author_id;
  }
}

class PostCreationError extends DomainError {
  constructor(message = 'Failed to create post') {
    super(message, 500);
  }
}

class PostUpdateError extends DomainError {
  constructor(post_id, message = 'Failed to update post') {
    super(`${message}: ${post_id}`, 500);
    this.post_id = post_id;
  }
}

class PostDeletionError extends DomainError {
  constructor(post_id, message = 'Failed to delete post') {
    super(`${message}: ${post_id}`, 500);
    this.post_id = post_id;
  }
}

class PostValidationError extends DomainError {
  constructor(message, details = {}) {
    super(message, 400);
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
