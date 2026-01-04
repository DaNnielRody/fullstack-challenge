import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getUserByIdService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const listUserByIdHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isInteger(id) && id > 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id: id }
      );
      logError('READ', 'USER', error, { user_id: id });
      throw error;
    }

    const { user } = await getUserByIdService({ user_id: id });
    return res.status(httpStatusCodes.OK).send({ users: user });
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listUserByIdHandler };
