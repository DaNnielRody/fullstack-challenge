import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getPostByUserIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

const listPostByIdHandler = async (req, res, next) => {
  try {
    const user_id = validatePositiveIntegerAndThrow(
      req.query.user_id,
      'user_id',
      PostValidationError,
      logError,
      'LIST',
      'POST'
    );

    const { posts } = await getPostByUserIdService({
      user_id,
    });

    return res.status(httpStatusCodes.OK).send({ posts });
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostByIdHandler };
