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

const updateUserService = async ({
  user_id,
  user_email,
  user_password,
  full_name,
}) => {
  try {
    if (!Number.isInteger(user_id) || user_id <= 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id }
      );
      logError('UPDATE', 'USER', error, { user_id });
      throw error;
    }

    const { users = [] } = await getUserRepositories({
      user_id,
    });

    const has_user = Array.isArray(users) && users.length === 1;

    if (!has_user) {
      const error = new UserNotFoundError(user_id);
      logError('UPDATE', 'USER', error, { user_id });
      throw error;
    }

    const currentUser = users[0];

    if (user_email !== currentUser.user_email) {
      const { users: existingUsers = [] } = await getUserByEmailRepositories({
        user_email,
      });

      if (existingUsers.length > 0) {
        const error = new UserEmailAlreadyExistsError(user_email);
        logError('UPDATE', 'USER', error, { user_id, user_email });
        throw error;
      }
    }

    const crypt_password = user_password
      ? bcrypt.hashSync(user_password, salt)
      : currentUser.user_password;

    await updateUserRepositories({
      user_id,
      user_email,
      user_password: crypt_password,
      full_name,
    });

    logUpdate('USER', {
      user_id,
      user_email,
      full_name,
    });

    return {
      user_id,
      user_email,
      full_name,
    };
  } catch (error) {
    handleServiceError('UPDATE', 'USER', error, {
      user_id,
      user_email,
    });
  }
};

export { updateUserService };
