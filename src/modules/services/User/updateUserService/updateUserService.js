import bcrypt from 'bcryptjs';
import {
  getUserRepositories,
  updateUserRepositories,
} from '#repositories/index.js';
import { logUpdate, logError } from '#common/services/logger/logger.js';
import {
  UserNotFoundError,
  UserValidationError,
  handleServiceError,
} from '#common/errors/index.js';

const salt = bcrypt.genSaltSync(10);

const updateUserService = async ({
  id,
  user_email,
  user_password,
  full_name,
}) => {
  try {
    if (Number.isInteger(id) && id > 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id: id }
      );
      logError('UPDATE', 'USER', error, { user_id: id });
      throw error;
    }

    const { users = [] } = await getUserRepositories({
      user_id: id,
    });

    const has_user = Array.isArray(users) && users.length === 1;

    if (!has_user) {
      const error = new UserNotFoundError(id);
      logError('UPDATE', 'USER', error, { user_id: id });
      throw error;
    }

    const crypt_password = bcrypt.hashSync(users[0].user_password, salt);

    await updateUserRepositories({
      id,
      user_email,
      user_password: crypt_password,
      full_name,
    });

    logUpdate('USER', {
      user_id: id,
      user_email,
      full_name,
    });

    return {
      updatedUser: {
        id,
        user_email,
        user_password,
        full_name,
      },
    };
  } catch (error) {
    handleServiceError('UPDATE', 'USER', error, {
      user_id: id,
      user_email,
    });
  }
};

export { updateUserService };
