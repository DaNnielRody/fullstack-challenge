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

const patchUserService = async ({
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
      'PATCH',
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
      'PATCH',
      'USER',
      { user_id }
    );

    const currentUser = users[0];

    if (user_email !== undefined && user_email !== currentUser.user_email) {
      validateStringAndThrow(
        user_email,
        'user_email',
        UserValidationError,
        logError,
        'PATCH',
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
        'PATCH',
        'USER',
        { user_id, user_email }
      );
    }

    const hashedPassword = user_password
      ? bcrypt.hashSync(user_password, salt)
      : undefined;

    await updateUserRepositories({
      user_id,
      user_email,
      user_password: hashedPassword,
      full_name,
    });

    const { users: updatedUsers = [] } = await getUserRepositories({
      user_id,
    });
    const updatedUser = updatedUsers[0];

    logUpdate('USER', {
      user_id,
      user_email: updatedUser.user_email,
      full_name: updatedUser.full_name,
      partial_update: true,
    });

    return {
      user_id: updatedUser.user_id,
      user_email: updatedUser.user_email,
      full_name: updatedUser.full_name,
    };
  } catch (error) {
    handleServiceError('PATCH', 'USER', error, {
      user_id,
      user_email,
    });
  }
};

export { patchUserService };
