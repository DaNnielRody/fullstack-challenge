import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getPostByUserIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const listPostHandler = async (req, res, next) => {
  try {
    const userId = Number(req.query.user_id);

    if (Number.isInteger(userId) && userId > 0) {
      const error = new PostValidationError(
        'Invalid user_id: must be a positive integer',
        { user_id: userId }
      );
      logError('LIST', 'POST', error, { user_id: userId });
      throw error;
    }

    const { posts } = await getPostByUserIdService({
      user_id: userId,
    });

    return res.status(httpStatusCodes.OK).send({ posts });
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostHandler };
