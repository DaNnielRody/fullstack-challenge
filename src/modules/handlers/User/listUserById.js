import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getUserByIdService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

const listUserByIdHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'user id',
      UserValidationError,
      logError,
      'READ',
      'USER'
    );

    const { user } = await getUserByIdService({ user_id });
    return res.status(httpStatusCodes.OK).send(user);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listUserByIdHandler };
