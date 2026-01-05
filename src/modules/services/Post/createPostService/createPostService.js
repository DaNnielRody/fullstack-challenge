import { getUserByIdService } from '#services/User/getUserByIdService/getUserByIdService.js';
import { createPostRepositories } from '#repositories/index.js';
import { logCreate, logError } from '#common/services/logger/logger.js';
import {
  AuthorNotFoundError,
  PostCreationError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
  validateArrayExistsAndThrow,
  validateCreationResultAndThrow,
} from '#common/validations/index.js';

const createPostService = async (post) => {
  try {
    const { author_id } = post;
    const { post_text } = post;

    validatePositiveIntegerAndThrow(
      author_id,
      'author_id',
      PostValidationError,
      logError,
      'CREATE',
      'POST'
    );

    validateStringAndThrow(
      post_text,
      'post_text',
      PostValidationError,
      logError,
      'CREATE',
      'POST',
      { author_id }
    );

    const { user } = await getUserByIdService({
      user_id: author_id,
    });

    validateArrayExistsAndThrow(
      user,
      'author',
      AuthorNotFoundError,
      logError,
      'CREATE',
      'POST',
      { author_id }
    );

    const { post_created } = await createPostRepositories({
      post,
    });

    validateCreationResultAndThrow(
      post_created,
      'post',
      PostCreationError,
      logError,
      'CREATE',
      'POST',
      { author_id }
    );

    logCreate('POST', {
      post_id: post_created[0],
      author_id,
      post_text_preview: post_text.slice(0, 80),
    });

    return {
      post_id: post_created[0],
      author_id,
      post_text,
    };
  } catch (error) {
    handleServiceError('CREATE', 'POST', error, {
      author_id: post.author_id,
    });
  }
};

export { createPostService };
