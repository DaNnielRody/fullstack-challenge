import {
  getPostByPostIdRepositories,
  updatePostRepositories,
} from '#repositories/index.js';
import { logUpdate, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
} from '#common/errors/index.js';

const updatePostService = async ({ id, author_id, post_text }) => {
  try {
    if (Number.isInteger(id) && id > 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id: id }
      );
      logError('UPDATE', 'POST', error, { post_id: id });
      throw error;
    }

    if (Number.isInteger(author_id) && author_id > 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id }
      );
      logError('UPDATE', 'POST', error, { post_id: id, author_id });
      throw error;
    }

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id: id,
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if (!has_post) {
      const error = new PostNotFoundError(id);
      logError('UPDATE', 'POST', error, { post_id: id });
      throw error;
    }

    await updatePostRepositories({
      id,
      author_id,
      post_text,
    });

    logUpdate('POST', {
      post_id: id,
      author_id,
    });

    return {
      updatedpost: {
        id,
        author_id,
        post_text,
      },
    };
  } catch (error) {
    logError('UPDATE', 'POST', error, { post_id: id });
    throw error;
  }
};

export { updatePostService };
