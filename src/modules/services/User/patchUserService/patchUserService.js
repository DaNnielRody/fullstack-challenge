import bcrypt from 'bcryptjs';
import {
  getUserRepositories,
  getUserByEmailRepositories,
  updateUserRepositories,
} from '#repositories/index.js';
import { logUpdate, logError } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  UserEmailAlreadyExistsError,
  handleServiceError,
} from '#common/errors/index.js';

const salt = bcrypt.genSaltSync(10);

const patchUserService = async ({
  id,
  user_email,
  user_password,
  full_name,
}) => {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id: id }
      );
      logError('PATCH', 'USER', error, { user_id: id });
      throw error;
    }

    const { users = [] } = await getUserRepositories({
      user_id: id,
    });

    const has_user = Array.isArray(users) && users.length === 1;

    if (!has_user) {
      const error = new UserNotFoundError(id);
      logError('PATCH', 'USER', error, { user_id: id });
      throw error;
    }

    const currentUser = users[0];

    if (user_email && user_email !== currentUser.user_email) {
      const { users: existingUsers = [] } = await getUserByEmailRepositories({
        user_email,
      });

      if (existingUsers.length > 0) {
        const error = new UserEmailAlreadyExistsError(user_email);
        logError('PATCH', 'USER', error, { user_id: id, user_email });
        throw error;
      }
    }

    const hashedPassword = user_password
      ? bcrypt.hashSync(user_password, salt)
      : undefined;

    await updateUserRepositories({
      id,
      user_email,
      user_password: hashedPassword,
      full_name,
    });

    const { users: updatedUsers = [] } = await getUserRepositories({
      user_id: id,
    });
    const updatedUser = updatedUsers[0];

    logUpdate('USER', {
      user_id: id,
      user_email: updatedUser.user_email,
      full_name: updatedUser.full_name,
      partial_update: true,
    });

    return {
      id: updatedUser.id,
      user_email: updatedUser.user_email,
      full_name: updatedUser.full_name,
    };
  } catch (error) {
    handleServiceError('PATCH', 'USER', error, {
      user_id: id,
      user_email,
    });
  }
};

export { patchUserService };
