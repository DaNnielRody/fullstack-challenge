import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updateUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const updateUserHandler = async (req, res, next) => {
  try {
    const user_id = Number(req.params.id);
    const { user_email, user_password, full_name } = req.body;

    if (!Number.isInteger(user_id) || user_id <= 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id }
      );
      logError('UPDATE', 'USER', error, { user_id });
      throw error;
    }

    if (typeof user_email !== 'string' || user_email.trim().length === 0) {
      const error = new UserValidationError(
        'Invalid user_email: must be a non-empty string',
        { user_email }
      );
      logError('UPDATE', 'USER', error, { user_id, user_email });
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
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

    if (typeof full_name !== 'string' || full_name.trim().length === 0) {
      const error = new UserValidationError(
        'Invalid full_name: must be a non-empty string',
        { full_name }
      );
      logError('UPDATE', 'USER', error, { user_id, user_email });
      throw error;
    }

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
