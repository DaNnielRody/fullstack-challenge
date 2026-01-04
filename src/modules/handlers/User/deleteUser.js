import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { deleteUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const deleteUserHandler = async (req, res, next) => {
  try {
    const user_id = Number(req.params.id);

    if (!Number.isInteger(user_id) || user_id <= 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id }
      );
      logError('DELETE', 'USER', error, { user_id });
      throw error;
    }

    await deleteUserService({
      user_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deleteUserHandler };
