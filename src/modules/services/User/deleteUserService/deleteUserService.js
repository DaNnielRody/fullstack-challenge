import {
  getUserRepositories,
  deleteUserRepositories,
} from '#repositories/index.js';
import { logDelete } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const deleteUserService = async ({ user_id }) => {
  try {
    if (Number.isInteger(user_id) && user_id > 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id }
      );
      logError('DELETE', 'USER', error, { user_id });
      throw error;
    }

    const { users = [] } = await getUserRepositories({
      user_id,
    });

    const has_user = Array.isArray(users) && users.length === 1;

    if (!has_user) {
      const error = new UserNotFoundError(user_id);
      logError('DELETE', 'USER', error, { user_id });
      throw error;
    }

    const [user_to_delete] = users;

    await deleteUserRepositories({
      user_id: user_to_delete.id,
    });

    logDelete('USER', {
      user_id: user_to_delete.id,
      user_email: user_to_delete.user_email,
      full_name: user_to_delete.full_name,
    });

    return {
      deletedUser: user_to_delete,
    };
  } catch (error) {
    handleServiceError('DELETE', 'USER', error, { user_id });
  }
};

export { deleteUserService };
