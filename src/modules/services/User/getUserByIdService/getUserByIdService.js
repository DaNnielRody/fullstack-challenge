import { getUsersByIdRepositories } from '#repositories/index.js';
import { logRead, logError } from '#common/services/logger/logger.js';
import {
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validatePositiveIntegerAndThrow,
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

    logRead('USER', { user_id, found: users.length > 0 });

    return {
      user: users,
    };
  } catch (error) {
    handleServiceError('READ', 'USER', error, { user_id });
  }
};

export { getUserByIdService };
