import {
  getPostByPostIdRepositories,
  deletePostRepositories,
} from '#repositories/index.js';
import { logDelete, logError } from '#common/services/logger/logger.js';
import {
  PostNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const deletePostService = async ({ post_id }) => {
  try {
    const { posts = [] } = await getPostByPostIdRepositories({
      post_id,
    });

    validateArrayHasOneAndThrow(
      posts,
      'post',
      PostNotFoundError,
      logError,
      'DELETE',
      'POST',
      { post_id }
    );

    const [post_to_delete] = posts;

    await deletePostRepositories({
      post_id: post_to_delete.post_id,
    });

    logDelete('POST', {
      post_id: post_to_delete.post_id,
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
