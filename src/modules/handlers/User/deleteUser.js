import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { deleteUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

const deleteUserHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'DELETE',
      'USER'
    );

    await deleteUserService({
      user_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deleteUserHandler };
