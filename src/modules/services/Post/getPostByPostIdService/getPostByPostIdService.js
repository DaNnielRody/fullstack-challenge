import { getPostByPostIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validatePositiveIntegerAndThrow,
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const getPostByPostIdService = async ({ post_id }) => {
  try {
    validatePositiveIntegerAndThrow(
      post_id,
      'post_id',
      PostValidationError,
      logError,
      'READ',
      'POST'
    );

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    validateArrayHasOneAndThrow(
      posts,
      'post',
      PostNotFoundError,
      logError,
      'READ',
      'POST',
      { post_id }
    );

    const [post] = posts;

    logRead('POST', { post_id });

    return {
      post,
    };
  } catch (error) {
    handleServiceError('READ', 'POST', error, { post_id });
  }
};

export { getPostByPostIdService };

