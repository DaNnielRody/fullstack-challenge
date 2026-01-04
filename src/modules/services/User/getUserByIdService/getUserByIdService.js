import { getUsersByIdRepositories } from '#repositories/index.js';
import { logRead } from '#common/services/logger/logger.js';
import {
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const getUserByIdService = async ({ user_id }) => {
  try {
    const has_user_id = Number.isInteger(user_id) && user_id > 0;

    if (has_user_id === false) {
      const error = new UserValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id }
      );
      logError('READ', 'USER', error, { user_id });
      throw error;
    }

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
