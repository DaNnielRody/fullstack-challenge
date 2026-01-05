import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { createUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateEmail,
  validatePassword,
  validateStringAndThrow,
} from '#common/validations/index.js';

const createUserHandler = async (req, res, next) => {
  try {
    const { user_email, user_password, full_name } = req.body;

    validateStringAndThrow(
      user_email,
      'user_email',
      UserValidationError,
      logError,
      'CREATE',
      'USER'
    );

    const emailValidation = validateEmail(user_email);
    if (!emailValidation.valid) {
      const error = new UserValidationError(emailValidation.error, {
        user_email,
      });
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    validateStringAndThrow(
      user_password,
      'user_password',
      UserValidationError,
      logError,
      'CREATE',
      'USER',
      { user_email }
    );

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.valid) {
      const error = new UserValidationError(passwordValidation.error, {});
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    validateStringAndThrow(
      full_name,
      'full_name',
      UserValidationError,
      logError,
      'CREATE',
      'USER',
      { user_email }
    );

    const created_user = await createUserService({
      user_email,
      user_password,
      full_name,
    });

    return res.status(httpStatusCodes.CREATED).send(created_user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { createUserHandler };
