import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updateUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateEmail,
  validatePassword,
  validatePositiveIntegerAndThrow,
  validateStringAndThrow,
} from '#common/validations/index.js';

const updateUserHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'UPDATE',
      'USER'
    );

    const { user_email, user_password, full_name } = req.body;

    validateStringAndThrow(
      user_email,
      'user_email',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id }
    );

    const emailValidation = validateEmail(user_email);
    if (!emailValidation.valid) {
      const error = new UserValidationError(emailValidation.error, {
        user_email,
      });
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

    validateStringAndThrow(
      user_password,
      'user_password',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id, user_email }
    );

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.valid) {
      const error = new UserValidationError(passwordValidation.error, {});
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

    validateStringAndThrow(
      full_name,
      'full_name',
      UserValidationError,
      logError,
      'UPDATE',
      'USER',
      { user_id, user_email }
    );

    const updated_user = await updateUserService({
      user_id,
      user_email,
      user_password,
      full_name,
    });

    return res.status(httpStatusCodes.OK).send(updated_user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { updateUserHandler };
