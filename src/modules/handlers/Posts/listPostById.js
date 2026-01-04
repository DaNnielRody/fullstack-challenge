import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getPostByUserIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const listPostByIdHandler = async (req, res, next) => {
  try {
    const user_id = Number(req.query.user_id);

    if (!Number.isInteger(user_id) || user_id <= 0) {
      const error = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id }
      );
      logError('LIST', 'POST', error, { user_id });
      throw error;
    }

    const { posts } = await getPostByUserIdService({
      user_id,
    });

    return res.status(httpStatusCodes.OK).send({ posts });
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostByIdHandler };
