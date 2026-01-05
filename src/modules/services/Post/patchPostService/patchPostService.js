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

const patchPostService = async ({ post_id, author_id, post_text }) => {
  try {
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
