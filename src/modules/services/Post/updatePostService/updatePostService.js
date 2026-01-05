import {
  getPostByPostIdRepositories,
  updatePostRepositories,
} from '#repositories/index.js';
import { logUpdate, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const updatePostService = async ({ post_id, author_id, post_text }) => {
  try {
    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    validateArrayHasOneAndThrow(
      posts,
      'post',
      PostNotFoundError,
      logError,
      'UPDATE',
      'POST',
      { post_id }
    );

    await updatePostRepositories({
      post_id,
      author_id,
      post_text,
    });

    logUpdate('POST', {
      post_id,
      author_id,
    });

    return {
      post_id,
      author_id,
      post_text,
    };
  } catch (error) {
    handleServiceError('UPDATE', 'POST', error, {
      post_id,
      author_id,
    });
  }
};

export { updatePostService };
