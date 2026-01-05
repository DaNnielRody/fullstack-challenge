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
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
  validateArrayHasOneAndThrow,
  validateArrayEmptyAndThrow,
} from '#common/validations/index.js';

const salt = bcrypt.genSaltSync(10);

const updateUserService = async ({
  user_id,
  user_email,
  user_password,
  full_name,
}) => {
  try {
    validatePositiveIntegerAndThrow(
      user_id,
      'user_id',
      UserValidationError,
      logError,
      'UPDATE',
      'USER'
    );

    const { users = [] } = await getUserRepositories({
      user_id,
    });

    validateArrayHasOneAndThrow(
      users,
      'user',
      UserNotFoundError,
      logError,
      'UPDATE',
      'USER',
      { user_id }
    );

    const currentUser = users[0];

    if (user_email !== currentUser.user_email) {
      validateStringAndThrow(
        user_email,
        'user_email',
        UserValidationError,
        logError,
        'UPDATE',
        'USER',
        { user_id }
      );

      const { users: existingUsers = [] } = await getUserByEmailRepositories({
        user_email,
      });

      validateArrayEmptyAndThrow(
        existingUsers,
        'user_email',
        UserEmailAlreadyExistsError,
        logError,
        'UPDATE',
        'USER',
        { user_id, user_email }
      );
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
