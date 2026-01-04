import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { createUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const createUserHandler = async (req, res, next) => {
  try {
    const { user_email, user_password, full_name } = req.body;

    if (typeof user_email !== 'string' || user_email.trim().length === 0) {
      const error = new UserValidationError(
        'Invalid user_email: must be a non-empty string',
        { user_email }
      );
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    if (
      typeof user_password !== 'string' ||
      user_password.trim().length === 0
    ) {
      const error = new UserValidationError(
        'Invalid user_password: must be a non-empty string',
        {}
      );
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

    if (typeof full_name !== 'string' || full_name.trim().length === 0) {
      const error = new UserValidationError(
        'Invalid full_name: must be a non-empty string',
        { full_name }
      );
      logError('CREATE', 'USER', error, { user_email });
      throw error;
    }

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
