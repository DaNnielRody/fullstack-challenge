import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updateUserService } from '#services/index.js';
import { UserValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const updateUserHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { user_email, user_password, full_name } = req.body;

    if (Number.isInteger(id) && id > 0) {
      const error = new UserValidationError(
        'Invalid user id: must be a positive integer',
        { user_id: id }
      );
      logError('UPDATE', 'USER', error, { user_id: id });
      throw error;
    }

    const updated_user = await updateUserService({
      id,
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
