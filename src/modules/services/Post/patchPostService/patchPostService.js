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
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const patchPostService = async ({ post_id, author_id, post_text }) => {
  try {
    validatePositiveIntegerAndThrow(
      post_id,
      'post_id',
      PostValidationError,
      logError,
      'PATCH',
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
      'PATCH',
      'POST',
      { post_id }
    );

    if (author_id !== undefined) {
      validatePositiveIntegerAndThrow(
        author_id,
        'author_id',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id }
      );
    }

    if (post_text !== undefined) {
      validateStringAndThrow(
        post_text,
        'post_text',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id, author_id }
      );
    }

    await updatePostRepositories({
      post_id,
      author_id,
      post_text,
    });

    const { posts: updatedPosts = [] } = await getPostByPostIdRepositories({
      post_id,
    });
    const updatedPost = updatedPosts[0];

    logUpdate('POST', {
      post_id,
      author_id: updatedPost.author_id,
      partial_update: true,
    });

    return {
      post_id: updatedPost.post_id,
      author_id: updatedPost.author_id,
      post_text: updatedPost.post_text,
    };
  } catch (error) {
    handleServiceError('PATCH', 'POST', error, {
      post_id,
      author_id,
    });
  }
};

export { patchPostService };
