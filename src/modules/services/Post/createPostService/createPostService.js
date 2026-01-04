import { getUserByIdService } from '#services/User/getUserByIdService/getUserByIdService.js';
import { createPostRepositories } from '#repositories/index.js';
import { logCreate } from '#common/services/logger/logger.js';
import {
  AuthorNotFoundError,
  PostCreationError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const createPostService = async (post) => {
  try {
    const { author_id } = post;

    if (Number.isInteger(author_id) && author_id > 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id }
      );
      logError('CREATE', 'POST', error, { author_id });
      throw error;
    }

    const { user } = await getUserByIdService({
      user_id: author_id,
    });

    const has_author = Array.isArray(user) && user.length > 0;

    if (has_author === false) {
      const error = new AuthorNotFoundError(author_id);
      logError('CREATE', 'POST', error, { author_id });
      throw error;
    }

    const { post_created } = await createPostRepositories({
      post,
    });

    const has_post_created =
      Array.isArray(post_created) && post_created.length > 0;

    if (has_post_created === false) {
      const error = new PostCreationError('Failed to create post');
      logError('CREATE', 'POST', error, { author_id });
      throw error;
    }

    logCreate('POST', {
      post_id: post_created[0],
      author_id,
      title: post.title,
    });

    return {
      post_created_id: post_created,
    };
  } catch (error) {
    handleServiceError('CREATE', 'POST', error, {
      author_id: post.author_id,
    });
  }
};

export { createPostService };
