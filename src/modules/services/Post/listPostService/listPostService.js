import { getUserByIdService } from '#services/User/getUserByIdService/getUserByIdService.js';
import { getPostByUserIdRepositories } from '#repositories/index.js';
import { logList, logError } from '#common/services/logger/logger.js';
import {
  AuthorNotFoundError,
  PostValidationError,
} from '#common/errors/index.js';

const getPostByUserIdService = async ({ user_id }) => {
  try {
    if (Number.isInteger(user_id) && user_id > 0) {
      const error = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id }
      );
      logError('LIST', 'POST', error, { user_id });
      throw error;
    }

    const { user } = await getUserByIdService({
      user_id,
    });

    const has_author = Array.isArray(user) && user.length > 0;

    if (has_author === false) {
      const error = new AuthorNotFoundError(user_id);
      logError('LIST', 'POST', error, { user_id });
      throw error;
    }

    const { posts = [] } = await getPostByUserIdRepositories({
      user_id,
    });

    logList('POST', { user_id, count: posts.length });

    return {
      posts,
    };
  } catch (error) {
    logError('LIST', 'POST', error, { user_id });
    throw error;
  }
};

export { getPostByUserIdService };
