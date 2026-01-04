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

const patchPostService = async ({ id, author_id, post_text }) => {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id: id }
      );
      logError('PATCH', 'POST', error, { post_id: id });
      throw error;
    }

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id: id,
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if (!has_post) {
      const error = new PostNotFoundError(id);
      logError('PATCH', 'POST', error, { post_id: id });
      throw error;
    }

    if (author_id && (!Number.isInteger(author_id) || author_id <= 0)) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id }
      );
      logError('PATCH', 'POST', error, { post_id: id, author_id });
      throw error;
    }

    await updatePostRepositories({
      id,
      author_id,
      post_text,
    });

    // Buscar dados atualizados
    const { posts: updatedPosts = [] } = await getPostByPostIdRepositories({
      post_id: id,
    });
    const updatedPost = updatedPosts[0];

    logUpdate('POST', {
      post_id: id,
      author_id: updatedPost.author_id,
      partial_update: true,
    });

    return {
      id: updatedPost.id,
      author_id: updatedPost.author_id,
      post_text: updatedPost.post_text,
    };
  } catch (error) {
    handleServiceError('PATCH', 'POST', error, {
      post_id: id,
      author_id,
    });
  }
};

export { patchPostService };
