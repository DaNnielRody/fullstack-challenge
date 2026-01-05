import { getUserByIdService } from '#services/User/getUserByIdService/getUserByIdService.js';
import { getPostByUserIdRepositories } from '#repositories/index.js';
import { logList, logError } from '#common/services/logger/logger.js';
import {
  AuthorNotFoundError,
  PostValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validatePositiveIntegerAndThrow,
  validateArrayExistsAndThrow,
} from '#common/validations/index.js';

const getPostByUserIdService = async ({ user_id }) => {
  try {
    validatePositiveIntegerAndThrow(
      user_id,
      'user_id',
      PostValidationError,
      logError,
      'LIST',
      'POST'
    );

    const { user } = await getUserByIdService({
      user_id,
    });

    validateArrayExistsAndThrow(
      user,
      'author',
      AuthorNotFoundError,
      logError,
      'LIST',
      'POST',
      { user_id }
    );

    const { posts = [] } = await getPostByUserIdRepositories({
      user_id,
    });

    logList('POST', { user_id, count: posts.length });

    return {
      posts,
    };
  } catch (error) {
    handleServiceError('LIST', 'POST', error, { user_id });
  }
};

export { getPostByUserIdService };
