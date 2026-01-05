import {
  getUserRepositories,
  deleteUserRepositories,
} from '#repositories/index.js';
import { logDelete, logError } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';
import {
  validateArrayHasOneAndThrow,
} from '#common/validations/index.js';

const deleteUserService = async ({ user_id }) => {
  try {
    const { users = [] } = await getUserRepositories({
      user_id,
    });

    validateArrayHasOneAndThrow(
      users,
      'user',
      UserNotFoundError,
      logError,
      'DELETE',
      'USER',
      { user_id }
    );

    const [user_to_delete] = users;

    await deleteUserRepositories({
      user_id: user_to_delete.user_id,
    });

    logDelete('USER', {
      user_id: user_to_delete.user_id,
      user_email: user_to_delete.user_email,
      full_name: user_to_delete.full_name,
    });

    const { user_password, ...userWithoutPassword } = user_to_delete;

    return {
      deletedUser: userWithoutPassword,
    };
  } catch (error) {
    handleServiceError('DELETE', 'USER', error, { user_id });
  }
};

export { deleteUserService };
