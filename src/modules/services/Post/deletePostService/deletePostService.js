import {
  getPostByPostIdRepositories,
  deletePostRepositories,
} from '#repositories/index.js';
import { logDelete } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const deletePostService = async ({ post_id }) => {
  try {
    if (Number.isInteger(post_id) && post_id > 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id }
      );
      logError('DELETE', 'POST', error, { post_id });
      throw error;
    }

    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if (!has_post) {
      const error = new PostNotFoundError(post_id);
      logError('DELETE', 'POST', error, { post_id });
      throw error;
    }

    const [post_to_delete] = posts;

    await deletePostRepositories({
      post_id: post_to_delete.id,
    });

    logDelete('POST', {
      post_id: post_to_delete.id,
      author_id: post_to_delete.author_id,
    });

    return {
      deletedPost: post_to_delete,
    };
  } catch (error) {
    handleServiceError('DELETE', 'POST', error, { post_id });
  }
};

export { deletePostService };
