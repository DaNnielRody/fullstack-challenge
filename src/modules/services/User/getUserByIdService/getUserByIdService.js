import { getUsersByIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validatePositiveIntegerAndThrow,
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const getUserByIdService = async ({ user_id }) => {
  try {
    validatePositiveIntegerAndThrow(
      user_id,
      'user_id',
      UserValidationError,
      logError,
      'READ',
      'USER'
    );

    const { users = [] } = await getUsersByIdRepositories({
      user_id,
    });

    validateArrayHasOneAndThrow(
      users,
      'user',
      UserNotFoundError,
      logError,
      'READ',
      'USER',
      { user_id }
    );

    const [user] = users;

    logRead('USER', { user_id });

    return {
      user,
    };
  } catch (error) {
    handleServiceError('READ', 'USER', error, { user_id });
  }
};

export { getUserByIdService };
