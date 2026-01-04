import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { patchUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const patchUserHandler = async (req, res, next) => {
  try {
    const user_id = Number(req.params.id);
    const { user_email, user_password, full_name } = req.body;

    if (!Number.isInteger(user_id) || user_id <= 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id }
      );
      logError('PATCH', 'USER', error, { user_id });
      throw error;
    }

    if (!user_email && !user_password && !full_name) {
      const error = new UserValidationError(
        'At least one field must be provided for update',
        {}
      );
      logError('PATCH', 'USER', error, { user_id });
      throw error;
    }

    const updated_user = await patchUserService({
      id: user_id,
      user_email,
      user_password,
      full_name,
    });

    return res.status(httpStatusCodes.OK).send(updated_user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { patchUserHandler };
