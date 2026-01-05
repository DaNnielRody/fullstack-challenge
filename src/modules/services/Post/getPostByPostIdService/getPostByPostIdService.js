import { getPostByPostIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const getPostByPostIdService = async ({ post_id }) => {
  try {
    if (!Number.isInteger(post_id) || post_id <= 0) {
      const error = new PostValidationError(
        'Invalid post_id: must be a positive integer',
        { post_id }
      );
      logError('READ', 'POST', error, { post_id });
      throw error;
    }

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if (!has_post) {
      const error = new PostNotFoundError(post_id);
      logError('READ', 'POST', error, { post_id });
      throw error;
    }

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

