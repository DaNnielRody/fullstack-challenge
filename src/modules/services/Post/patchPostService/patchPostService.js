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

const patchPostService = async ({ post_id, author_id, post_text }) => {
  try {
    if (!Number.isInteger(post_id) || post_id <= 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id }
      );
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if (!has_post) {
      const error = new PostNotFoundError(post_id);
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    if (author_id && (!Number.isInteger(author_id) || author_id <= 0)) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id }
      );
      logError('PATCH', 'POST', error, { post_id, author_id });
      throw error;
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
